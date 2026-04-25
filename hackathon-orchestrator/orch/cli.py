"""Typer CLI entrypoint."""

from __future__ import annotations

import json
from pathlib import Path

import typer
from rich.console import Console

from .config import Settings
from .github import list_ready_issues
from .orchestrator import Orchestrator

app = typer.Typer(add_completion=False, help="Agent orchestrator for hackathon demos.")
console = Console()


@app.command()
def run(
    repo_path: Path = typer.Option(
        ...,
        "--repo-path",
        help="Path to a local checkout of the target repository (used as main worktree).",
        exists=True,
        file_okay=False,
        dir_okay=True,
        resolve_path=True,
    ),
    issue: int | None = typer.Option(
        None,
        "--issue",
        help="Specific issue number to process. If omitted, picks the first open issue with the configured label.",
    ),
) -> None:
    """Run one end-to-end orchestration: issue -> code -> checks -> fix -> PR."""
    settings = Settings.load()
    orch = Orchestrator(settings=settings, main_repo=repo_path)
    record = orch.run(issue_number=issue)

    console.rule(f"[bold]Run {record.run_id}[/bold]")
    console.print_json(data=record.model_dump())

    if record.status != "success":
        raise typer.Exit(code=1)


@app.command("list-issues")
def list_issues(
    label: str | None = typer.Option(None, "--label", help="Override label from env."),
) -> None:
    """Show open issues that match the configured (or overridden) label."""
    settings = Settings.load()
    issues = list_ready_issues(settings.gh_repo, label or settings.issue_label, limit=20)
    console.print(json.dumps([i.model_dump() for i in issues], indent=2, ensure_ascii=False))


@app.command("doctor")
def doctor() -> None:
    """Print effective config and basic sanity checks."""
    settings = Settings.load()
    masked = {
        "openrouter_base_url": settings.openrouter_base_url,
        "openrouter_api_key": _mask(settings.openrouter_api_key),
        "cursor_bin": settings.cursor_bin,
        "cursor_api_key_set": bool(settings.cursor_api_key),
        "planner_model": settings.planner_model,
        "fixer_model": settings.fixer_model,
        "reviewer_model": settings.reviewer_model,
        "gh_repo": settings.gh_repo,
        "issue_label": settings.issue_label,
        "base_branch": settings.base_branch,
        "max_repair_attempts": settings.max_repair_attempts,
        "run_log_dir": str(settings.run_log_dir),
        "worktrees_dir": str(settings.worktrees_dir),
    }
    console.print_json(data=masked)


def _mask(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 8:
        return "***"
    return f"{value[:4]}...{value[-4:]}"


if __name__ == "__main__":
    app()
