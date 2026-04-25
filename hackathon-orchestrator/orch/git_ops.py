"""Thin wrappers around git and git worktree for run isolation."""

from __future__ import annotations

import shlex
import subprocess
from pathlib import Path


class GitError(RuntimeError):
    pass


def run_git(args: list[str], cwd: Path, *, check: bool = True) -> subprocess.CompletedProcess[str]:
    proc = subprocess.run(
        ["git", *args],
        cwd=str(cwd),
        capture_output=True,
        text=True,
        check=False,
    )
    if check and proc.returncode != 0:
        raise GitError(
            f"git {' '.join(shlex.quote(a) for a in args)} failed in {cwd}: "
            f"{proc.stderr.strip() or proc.stdout.strip()}"
        )
    return proc


def ensure_clean(repo: Path) -> None:
    status = run_git(["status", "--porcelain"], repo).stdout.strip()
    if status:
        raise GitError(f"Repository {repo} is not clean:\n{status}")


def create_worktree(
    *,
    main_repo: Path,
    worktrees_dir: Path,
    branch: str,
    base_branch: str,
) -> Path:
    worktrees_dir.mkdir(parents=True, exist_ok=True)
    target = worktrees_dir / branch.replace("/", "_")
    if target.exists():
        raise GitError(f"Worktree target already exists: {target}")

    run_git(["fetch", "origin", base_branch], main_repo, check=False)
    run_git(
        ["worktree", "add", "-b", branch, str(target), f"origin/{base_branch}"],
        main_repo,
    )
    return target


def remove_worktree(main_repo: Path, worktree: Path) -> None:
    run_git(["worktree", "remove", "--force", str(worktree)], main_repo, check=False)


def get_changed_files(worktree: Path) -> list[str]:
    tracked = run_git(["diff", "--name-only"], worktree, check=False).stdout.splitlines()
    untracked = run_git(
        ["ls-files", "--others", "--exclude-standard"], worktree, check=False
    ).stdout.splitlines()
    return sorted({*tracked, *untracked})


def get_diff(worktree: Path) -> str:
    tracked = run_git(["diff"], worktree, check=False).stdout
    # Include a summary of untracked files; full content can be large.
    untracked_names = run_git(
        ["ls-files", "--others", "--exclude-standard"], worktree, check=False
    ).stdout.strip()
    if untracked_names:
        tracked += "\n\n# Untracked files\n" + untracked_names + "\n"
    return tracked


def diff_stat(worktree: Path) -> str:
    return run_git(["diff", "--stat"], worktree, check=False).stdout.strip()


def commit_all(worktree: Path, message: str) -> None:
    run_git(["add", "-A"], worktree)
    run_git(["commit", "-m", message], worktree)


def push_branch(worktree: Path, branch: str) -> None:
    run_git(["push", "-u", "origin", branch], worktree)
