"""Top-level state machine that ties everything together.

Deterministic pipeline:

    issue -> plan -> worktree -> cursor (code) -> checks
        -> [if fail] fixer plan -> cursor (repair) -> checks (repeat, limited)
        -> commit -> push -> open PR
"""

from __future__ import annotations

import json
import re
import time
from dataclasses import dataclass
from pathlib import Path

from agents import RunConfig, Runner

from .agents_factory import build_fixer, build_planner
from .config import Settings
from .cursor import CursorAgent
from .git_ops import commit_all, create_worktree, push_branch, remove_worktree
from .github import create_pr, fetch_issue, list_ready_issues
from .logger import RunLogger, console
from .models import (
    CursorRunResult,
    ExecutionBrief,
    QualityReport,
    RepairPlan,
    RunRecord,
    TaskSpec,
)
from .providers import build_provider
from .quality import format_failures, run_checks


@dataclass
class Orchestrator:
    settings: Settings
    main_repo: Path

    def __post_init__(self) -> None:
        self.provider = build_provider(self.settings)
        self.run_config = RunConfig(model_provider=self.provider)
        self.cursor = CursorAgent(self.settings)
        self.planner = build_planner(self.settings)
        self.fixer = build_fixer(self.settings)

    def pick_task(self, *, issue_number: int | None) -> TaskSpec | None:
        if issue_number is not None:
            return fetch_issue(self.settings.gh_repo, issue_number)
        issues = list_ready_issues(self.settings.gh_repo, self.settings.issue_label, limit=1)
        return issues[0] if issues else None

    def run(self, *, issue_number: int | None = None) -> RunRecord:
        log = RunLogger(self.settings.run_log_dir)
        log.event("orchestrator", "start", repo=self.settings.gh_repo)

        task = self.pick_task(issue_number=issue_number)
        if task is None:
            log.event("intake", "skipped", reason="no-ready-issues")
            return RunRecord(
                run_id=log.run_id, issue_number=0, status="skipped", attempts=0
            )
        log.event("intake", "ok", issue=task.issue_number, title=task.title)

        brief = self._plan(task, log)
        if not brief.is_ready:
            log.event("planner", "needs_human_help", reason=brief.clarification_needed)
            return RunRecord(
                run_id=log.run_id,
                issue_number=task.issue_number,
                status="needs_human_help",
                attempts=0,
            )

        branch = f"orch/{task.issue_number}-{log.run_id}"
        worktree = create_worktree(
            main_repo=self.main_repo,
            worktrees_dir=self.settings.worktrees_dir,
            branch=branch,
            base_branch=self.settings.base_branch,
        )
        log.event("repo_prep", "ok", branch=branch, worktree=str(worktree))

        attempts = 0
        try:
            cursor_result = self._run_cursor_initial(worktree, task, brief, log)
            if not cursor_result.changed_files:
                log.event("cursor", "no_diff", exit=cursor_result.exit_code)
                return RunRecord(
                    run_id=log.run_id,
                    issue_number=task.issue_number,
                    status="failed_cursor",
                    attempts=1,
                    branch=branch,
                )
            attempts = 1

            report = self._run_checks(worktree, log)

            while not report.ok and attempts <= self.settings.max_repair_attempts:
                failing = format_failures(report)
                plan = self._plan_repair(task, brief, cursor_result, failing, log)
                if plan.give_up:
                    log.event("fixer", "give_up", reason=plan.give_up_reason)
                    return RunRecord(
                        run_id=log.run_id,
                        issue_number=task.issue_number,
                        status="needs_human_help",
                        attempts=attempts,
                        branch=branch,
                    )
                attempts += 1
                cursor_result = self._run_cursor_repair(
                    worktree, task, brief, plan, failing, log
                )
                report = self._run_checks(worktree, log)

            if not report.ok:
                log.event("checks", "exhausted", attempts=attempts)
                return RunRecord(
                    run_id=log.run_id,
                    issue_number=task.issue_number,
                    status="failed_checks",
                    attempts=attempts,
                    branch=branch,
                )

            pr_url = self._open_pr(worktree, task, brief, branch, log)
            return RunRecord(
                run_id=log.run_id,
                issue_number=task.issue_number,
                status="success",
                attempts=attempts,
                branch=branch,
                pr_url=pr_url,
            )
        finally:
            remove_worktree(self.main_repo, worktree)
            log.event("cleanup", "ok", worktree=str(worktree))

    def _plan(self, task: TaskSpec, log: RunLogger) -> ExecutionBrief:
        with log.step("planner", model=self.settings.planner_model):
            prompt = (
                f"Issue #{task.issue_number}: {task.title}\n\n"
                f"{task.body or '(no body)'}\n\n"
                f"Labels: {', '.join(task.labels) or '(none)'}"
            )
            result = Runner.run_sync(self.planner, prompt, run_config=self.run_config)
            brief = _parse_execution_brief(str(result.final_output))
        log.event(
            "planner",
            "ok",
            task_type=brief.task_type.value,
            ready=brief.is_ready,
            criteria=len(brief.acceptance_criteria),
        )
        return brief

    def _plan_repair(
        self,
        task: TaskSpec,
        brief: ExecutionBrief,
        cursor_result: CursorRunResult,
        failing: str,
        log: RunLogger,
    ) -> RepairPlan:
        with log.step("fixer", model=self.settings.fixer_model):
            prompt = (
                f"Task: {task.title}\n"
                f"Brief: {brief.summary}\n\n"
                f"Current diff (truncated):\n```\n{cursor_result.diff[-4000:]}\n```\n\n"
                f"Failing checks:\n```\n{failing}\n```"
            )
            result = Runner.run_sync(self.fixer, prompt, run_config=self.run_config)
            plan = _parse_repair_plan(str(result.final_output))
        log.event(
            "fixer",
            "ok",
            targets=len(plan.target_files),
            steps=len(plan.instructions),
            give_up=plan.give_up,
        )
        return plan

    def _run_cursor_initial(
        self,
        worktree: Path,
        task: TaskSpec,
        brief: ExecutionBrief,
        log: RunLogger,
    ) -> CursorRunResult:
        start = time.perf_counter()
        log.event("cursor", "start", phase="initial")
        result = self.cursor.run_initial(worktree=worktree, task=task, brief=brief)
        log.event(
            "cursor",
            "end",
            phase="initial",
            exit=result.exit_code,
            timed_out=result.timed_out,
            duration_ms=int((time.perf_counter() - start) * 1000),
            changed_files=len(result.changed_files),
        )
        return result

    def _run_cursor_repair(
        self,
        worktree: Path,
        task: TaskSpec,
        brief: ExecutionBrief,
        plan: RepairPlan,
        failing: str,
        log: RunLogger,
    ) -> CursorRunResult:
        start = time.perf_counter()
        log.event("cursor", "start", phase="repair")
        result = self.cursor.run_repair(
            worktree=worktree,
            task=task,
            brief=brief,
            plan=plan,
            failing_output=failing,
        )
        log.event(
            "cursor",
            "end",
            phase="repair",
            exit=result.exit_code,
            timed_out=result.timed_out,
            duration_ms=int((time.perf_counter() - start) * 1000),
            changed_files=len(result.changed_files),
        )
        return result

    def _run_checks(self, worktree: Path, log: RunLogger) -> QualityReport:
        with log.step("checks"):
            report = run_checks(worktree)
        for c in report.checks:
            log.event(
                "checks",
                "ok" if c.ok else "fail",
                name=c.name,
                exit=c.exit_code,
                duration_ms=c.duration_ms,
            )
        return report

    def _open_pr(
        self,
        worktree: Path,
        task: TaskSpec,
        brief: ExecutionBrief,
        branch: str,
        log: RunLogger,
    ) -> str:
        with log.step("pr"):
            commit_all(worktree, f"orch: resolve #{task.issue_number} {task.title}")
            push_branch(worktree, branch)
            body = _render_pr_body(task, brief, log.run_id)
            url = create_pr(
                repo=self.settings.gh_repo,
                cwd=worktree,
                head_branch=branch,
                base_branch=self.settings.base_branch,
                title=f"[orch] {task.title} (closes #{task.issue_number})",
                body=body,
            )
        log.event("pr", "ok", url=url)
        console.print(f"[green]PR created:[/green] {url}")
        return url


def _render_pr_body(task: TaskSpec, brief: ExecutionBrief, run_id: str) -> str:
    criteria = "\n".join(f"- [x] {c}" for c in brief.acceptance_criteria) or "- [x] see issue"
    return f"""\
## Summary

{brief.summary}

Closes #{task.issue_number}.

## Acceptance criteria

{criteria}

## Trace

Generated by `orch` (run `{run_id}`). Task type: `{brief.task_type.value}`.
"""


def _strip_markdown_fence(text: str) -> str:
    """Extract JSON from markdown fences if the model wrapped the payload."""
    candidate = text.strip()
    match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", candidate, flags=re.S)
    if match:
        return match.group(1).strip()
    return candidate


def _load_json_relaxed(text: str) -> dict:
    payload = _strip_markdown_fence(text)
    data = json.loads(payload)
    if not isinstance(data, dict):
        raise ValueError("Model output must be a JSON object")
    return data


def _parse_execution_brief(text: str) -> ExecutionBrief:
    data = _load_json_relaxed(text)
    # Backward/alternate keys often returned by models.
    if "files_to_examine" in data and "suggested_files" not in data:
        data["suggested_files"] = data["files_to_examine"]
    if "clarification_question" in data and "clarification_needed" not in data:
        data["clarification_needed"] = data["clarification_question"]
    return ExecutionBrief.model_validate(data)


def _parse_repair_plan(text: str) -> RepairPlan:
    data = _load_json_relaxed(text)
    return RepairPlan.model_validate(data)
