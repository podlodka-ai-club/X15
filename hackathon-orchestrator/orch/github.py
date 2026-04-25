"""GitHub Issue intake and PR creation via the `gh` CLI.

We intentionally shell out to `gh` instead of talking to the REST API directly.
It removes a whole class of auth code (gh handles tokens, SSO, SAML, etc.) and
keeps the orchestrator small. The user is expected to have run
``gh auth login`` once on their machine.
"""

from __future__ import annotations

import json
import shlex
import subprocess
from pathlib import Path

from .models import TaskSpec


class GhError(RuntimeError):
    pass


def _run_gh(args: list[str], cwd: Path | None = None) -> str:
    proc = subprocess.run(
        ["gh", *args],
        cwd=str(cwd) if cwd else None,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        raise GhError(
            f"gh {' '.join(shlex.quote(a) for a in args)} failed: "
            f"{proc.stderr.strip() or proc.stdout.strip()}"
        )
    return proc.stdout


def list_ready_issues(repo: str, label: str, limit: int = 10) -> list[TaskSpec]:
    raw = _run_gh(
        [
            "issue", "list",
            "--repo", repo,
            "--label", label,
            "--state", "open",
            "--limit", str(limit),
            "--json", "number,title,body,url,labels",
        ]
    )
    data = json.loads(raw)
    return [_to_taskspec(item, repo) for item in data]


def fetch_issue(repo: str, number: int) -> TaskSpec:
    raw = _run_gh(
        [
            "issue", "view", str(number),
            "--repo", repo,
            "--json", "number,title,body,url,labels",
        ]
    )
    return _to_taskspec(json.loads(raw), repo)


def _to_taskspec(item: dict, repo: str) -> TaskSpec:
    labels = [lb["name"] for lb in item.get("labels", []) if isinstance(lb, dict) and "name" in lb]
    return TaskSpec(
        issue_number=item["number"],
        title=item["title"],
        body=item.get("body") or "",
        url=item["url"],
        labels=labels,
        repo=repo,
    )


def create_pr(
    *,
    repo: str,
    cwd: Path,
    head_branch: str,
    base_branch: str,
    title: str,
    body: str,
) -> str:
    stdout = _run_gh(
        [
            "pr", "create",
            "--repo", repo,
            "--head", head_branch,
            "--base", base_branch,
            "--title", title,
            "--body", body,
        ],
        cwd=cwd,
    )
    url = stdout.strip().splitlines()[-1]
    return url


def post_issue_comment(repo: str, number: int, body: str) -> None:
    _run_gh(["issue", "comment", str(number), "--repo", repo, "--body", body])
