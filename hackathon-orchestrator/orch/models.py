"""Pydantic data models shared across steps."""

from __future__ import annotations

from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class TaskType(StrEnum):
    BUGFIX = "bugfix"
    SMALL_FEATURE = "small_feature"
    UNKNOWN = "unknown"


class TaskSpec(BaseModel):
    """Normalized description of a single issue we will work on."""

    issue_number: int
    title: str
    body: str
    url: str
    labels: list[str] = Field(default_factory=list)
    repo: str


class ExecutionBrief(BaseModel):
    """Planner output handed to the coding agent."""

    task_type: TaskType
    summary: str = Field(description="One-paragraph restatement of what to do")
    acceptance_criteria: list[str] = Field(default_factory=list)
    suggested_files: list[str] = Field(
        default_factory=list,
        description="Files the coding agent should likely inspect or edit",
    )
    risks: list[str] = Field(default_factory=list)
    is_ready: bool = Field(
        default=True,
        description="False if the issue is too vague to work on without clarification",
    )
    clarification_needed: str | None = None


class CursorRunResult(BaseModel):
    """Outcome of a single Cursor CLI subprocess run."""

    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int
    changed_files: list[str] = Field(default_factory=list)
    diff: str = ""
    summary: str = ""
    timed_out: bool = False


class CheckResult(BaseModel):
    name: str
    ok: bool
    exit_code: int
    stdout: str
    stderr: str
    duration_ms: int


class QualityReport(BaseModel):
    ok: bool
    checks: list[CheckResult]

    @property
    def failed(self) -> list[CheckResult]:
        return [c for c in self.checks if not c.ok]


class RepairPlan(BaseModel):
    """Fixer agent output: structured guidance for a retry of the coding agent."""

    diagnosis: str = Field(description="Short summary of what is broken and why")
    target_files: list[str] = Field(default_factory=list)
    instructions: list[str] = Field(
        default_factory=list,
        description="Concrete, ordered steps the coding agent should execute",
    )
    give_up: bool = Field(
        default=False,
        description="Set true if no reasonable fix is possible without human help",
    )
    give_up_reason: str | None = None


RunStatus = Literal[
    "success",
    "failed_checks",
    "failed_cursor",
    "failed_pr",
    "needs_human_help",
    "skipped",
]


class RunRecord(BaseModel):
    run_id: str
    issue_number: int
    status: RunStatus
    attempts: int
    pr_url: str | None = None
    branch: str | None = None
