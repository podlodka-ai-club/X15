"""Quality gates runner.

Keeps a small list of shell commands to run against a worktree. Each command
is labelled, captured, and timed. A check is considered OK iff its exit code
is zero. A command that is not installed is surfaced as a failing check with a
clear message, so the Fixer agent can react to it.
"""

from __future__ import annotations

import shlex
import shutil
import subprocess
import time
from collections.abc import Iterable
from pathlib import Path

from .models import CheckResult, QualityReport

DEFAULT_PYTHON_CHECKS: list[tuple[str, str]] = [
    ("lint", "ruff check ."),
    ("tests", "pytest -x -q"),
]


def run_checks(
    worktree: Path,
    checks: Iterable[tuple[str, str]] | None = None,
    *,
    timeout_s: int = 300,
) -> QualityReport:
    checks = list(checks or DEFAULT_PYTHON_CHECKS)
    results: list[CheckResult] = []
    for name, cmd in checks:
        results.append(_run_single(name, cmd, worktree, timeout_s=timeout_s))
    return QualityReport(ok=all(r.ok for r in results), checks=results)


def _run_single(name: str, cmd: str, worktree: Path, *, timeout_s: int) -> CheckResult:
    argv = shlex.split(cmd)
    if not shutil.which(argv[0]):
        return CheckResult(
            name=name,
            ok=False,
            exit_code=127,
            stdout="",
            stderr=f"command not found: {argv[0]}",
            duration_ms=0,
        )

    started = time.perf_counter()
    try:
        proc = subprocess.run(
            argv,
            cwd=str(worktree),
            capture_output=True,
            text=True,
            timeout=timeout_s,
            check=False,
        )
        stdout, stderr, exit_code = proc.stdout, proc.stderr, proc.returncode
    except subprocess.TimeoutExpired as exc:
        stdout = (exc.stdout.decode() if isinstance(exc.stdout, bytes) else exc.stdout) or ""
        stderr = (exc.stderr.decode() if isinstance(exc.stderr, bytes) else exc.stderr) or ""
        exit_code = 124

    duration_ms = int((time.perf_counter() - started) * 1000)
    return CheckResult(
        name=name,
        ok=exit_code == 0,
        exit_code=exit_code,
        stdout=stdout,
        stderr=stderr,
        duration_ms=duration_ms,
    )


def format_failures(report: QualityReport, *, max_chars: int = 4000) -> str:
    """Render a compact, Fixer-friendly digest of what went wrong."""
    if report.ok:
        return ""
    chunks: list[str] = []
    for c in report.failed:
        body = (c.stderr or c.stdout or "").strip()
        chunks.append(f"### {c.name} (exit {c.exit_code})\n{body}")
    joined = "\n\n".join(chunks)
    return joined[-max_chars:]
