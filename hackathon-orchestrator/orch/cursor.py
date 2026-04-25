"""Wrapper around Cursor CLI used as the coding agent.

We invoke Cursor CLI in headless mode:

    cursor-agent -p --force --output-format json \
        --workspace <worktree_dir> "<prompt>"

The wrapper is intentionally thin. It builds a deterministic prompt from the
``TaskSpec`` and ``ExecutionBrief``, spawns the subprocess, captures its output
with a timeout, and then reads the resulting ``git diff`` from the worktree so
the orchestrator has a clean contract: either the agent produced a diff or it
did not.
"""

from __future__ import annotations

import subprocess
import time
from pathlib import Path

from .config import Settings
from .git_ops import diff_stat, get_changed_files, get_diff
from .models import CursorRunResult, ExecutionBrief, RepairPlan, TaskSpec


def _build_initial_prompt(task: TaskSpec, brief: ExecutionBrief) -> str:
    crit = "\n".join(f"- {c}" for c in brief.acceptance_criteria) or "- (none provided)"
    files = "\n".join(f"- {f}" for f in brief.suggested_files) or "- (explore repo to decide)"
    risks = "\n".join(f"- {r}" for r in brief.risks) or "- (none noted)"
    return f"""\
You are a senior engineer resolving a GitHub issue on behalf of an agent orchestrator.

## Issue #{task.issue_number}: {task.title}

{task.body or "(no body provided)"}

## Execution brief

Task type: {brief.task_type.value}

{brief.summary}

### Acceptance criteria
{crit}

### Likely files to inspect
{files}

### Known risks
{risks}

## Rules

1. Make the minimum set of edits necessary to satisfy the acceptance criteria.
2. Keep the public API stable unless the issue explicitly asks for a change.
3. If the repository has tests, add or update tests that prove your change works.
4. Do not create throwaway scripts, TODOs, or commented-out code.
5. Do not commit, push, or open PRs. The orchestrator handles git operations.
6. When finished, print a short summary of the changes you made.
"""


def _build_repair_prompt(
    task: TaskSpec,
    brief: ExecutionBrief,
    plan: RepairPlan,
    failing_output: str,
) -> str:
    steps = "\n".join(f"{i + 1}. {s}" for i, s in enumerate(plan.instructions)) or "1. Investigate and fix."
    targets = "\n".join(f"- {f}" for f in plan.target_files) or "- (decide from diagnosis)"
    return f"""\
Previous attempt on issue #{task.issue_number} ({task.title}) failed quality gates.

## Diagnosis from the repair planner
{plan.diagnosis}

## Target files
{targets}

## Ordered instructions
{steps}

## Failing output (truncated)
```
{failing_output[-4000:]}
```

Apply the minimum edits needed to make the failing checks pass. Do not revert
the previous correct work unless the diagnosis says so. Do not commit or push.
"""


class CursorAgent:
    """Subprocess-based wrapper around the headless Cursor CLI."""

    def __init__(self, settings: Settings):
        self.settings = settings

    def run_initial(
        self,
        *,
        worktree: Path,
        task: TaskSpec,
        brief: ExecutionBrief,
    ) -> CursorRunResult:
        prompt = _build_initial_prompt(task, brief)
        return self._invoke(worktree=worktree, prompt=prompt)

    def run_repair(
        self,
        *,
        worktree: Path,
        task: TaskSpec,
        brief: ExecutionBrief,
        plan: RepairPlan,
        failing_output: str,
    ) -> CursorRunResult:
        prompt = _build_repair_prompt(task, brief, plan, failing_output)
        return self._invoke(worktree=worktree, prompt=prompt)

    def _invoke(self, *, worktree: Path, prompt: str) -> CursorRunResult:
        cmd = [
            self.settings.cursor_bin,
            "-p",
            "--force",
            "--output-format",
            "json",
            "--workspace",
            str(worktree),
            prompt,
        ]

        started = time.perf_counter()
        timed_out = False
        try:
            proc = subprocess.run(
                cmd,
                cwd=str(worktree),
                capture_output=True,
                text=True,
                timeout=self.settings.cursor_timeout_s,
                check=False,
            )
            stdout, stderr, exit_code = proc.stdout, proc.stderr, proc.returncode
        except subprocess.TimeoutExpired as exc:
            stdout = (exc.stdout.decode() if isinstance(exc.stdout, bytes) else exc.stdout) or ""
            stderr = (exc.stderr.decode() if isinstance(exc.stderr, bytes) else exc.stderr) or ""
            exit_code = 124
            timed_out = True

        duration_ms = int((time.perf_counter() - started) * 1000)

        changed_files = get_changed_files(worktree)
        diff = get_diff(worktree) if changed_files else ""
        summary = diff_stat(worktree) if changed_files else ""

        return CursorRunResult(
            exit_code=exit_code,
            stdout=stdout,
            stderr=stderr,
            duration_ms=duration_ms,
            changed_files=changed_files,
            diff=diff,
            summary=summary,
            timed_out=timed_out,
        )
