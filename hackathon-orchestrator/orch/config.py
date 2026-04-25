"""Runtime config loaded from environment variables."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _env(name: str, default: str | None = None, *, required: bool = False) -> str:
    value = os.getenv(name, default)
    if required and not value:
        raise RuntimeError(f"Missing required env var: {name}")
    return value or ""


@dataclass(frozen=True)
class Settings:
    openrouter_api_key: str
    openrouter_base_url: str

    planner_model: str
    fixer_model: str
    reviewer_model: str

    cursor_bin: str
    cursor_api_key: str
    cursor_timeout_s: int

    gh_repo: str
    issue_label: str
    base_branch: str

    max_repair_attempts: int
    run_log_dir: Path
    worktrees_dir: Path

    @classmethod
    def load(cls) -> Settings:
        return cls(
            openrouter_api_key=_env("OPENROUTER_API_KEY", required=True),
            openrouter_base_url=_env(
                "OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"
            ),
            planner_model=_env("ORCH_PLANNER_MODEL", "anthropic/claude-sonnet-4"),
            fixer_model=_env("ORCH_FIXER_MODEL", "anthropic/claude-sonnet-4"),
            reviewer_model=_env("ORCH_REVIEWER_MODEL", "openai/gpt-4o-mini"),
            cursor_bin=_env("ORCH_CURSOR_BIN", "cursor-agent"),
            cursor_api_key=_env("CURSOR_API_KEY", ""),
            cursor_timeout_s=int(_env("ORCH_CURSOR_TIMEOUT_S", "600")),
            gh_repo=_env("ORCH_GH_REPO", required=True),
            issue_label=_env("ORCH_ISSUE_LABEL", "agent-ready"),
            base_branch=_env("ORCH_BASE_BRANCH", "main"),
            max_repair_attempts=int(_env("ORCH_MAX_REPAIR_ATTEMPTS", "2")),
            run_log_dir=Path(_env("ORCH_RUN_LOG_DIR", "./runs")).resolve(),
            worktrees_dir=Path(_env("ORCH_WORKTREES_DIR", "./.worktrees")).resolve(),
        )
