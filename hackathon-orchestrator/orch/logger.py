"""JSONL run logger and a small Rich console helper."""

from __future__ import annotations

import json
import time
import uuid
from contextlib import contextmanager
from pathlib import Path
from typing import Any

from rich.console import Console

console = Console()


class RunLogger:
    """Append-only JSONL logger for a single orchestrator run."""

    def __init__(self, log_dir: Path, run_id: str | None = None):
        self.run_id = run_id or uuid.uuid4().hex[:12]
        log_dir.mkdir(parents=True, exist_ok=True)
        self.path = log_dir / f"{self.run_id}.jsonl"

    def event(self, step: str, status: str = "info", **fields: Any) -> None:
        payload = {
            "ts": time.time(),
            "run_id": self.run_id,
            "step": step,
            "status": status,
            **fields,
        }
        with self.path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(payload, ensure_ascii=False, default=str) + "\n")
        console.log(f"[cyan]{step}[/cyan] [dim]{status}[/dim]  "
                    + " ".join(f"{k}={v}" for k, v in fields.items() if k != "raw"))

    @contextmanager
    def step(self, step: str, **fields: Any):
        start = time.perf_counter()
        self.event(step, "start", **fields)
        try:
            yield
        except Exception as exc:
            duration_ms = int((time.perf_counter() - start) * 1000)
            self.event(step, "error", duration_ms=duration_ms, error=str(exc))
            raise
        duration_ms = int((time.perf_counter() - start) * 1000)
        self.event(step, "end", duration_ms=duration_ms)
