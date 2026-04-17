from __future__ import annotations

import copy
import threading
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from app.data_builder.schemas.mysql import MySQLConnectionIn
from app.data_builder.schemas.tasks import (
    AssertionRunItemOut,
    AssertionSummaryOut,
    BatchProgressOut,
    CleanupStatusOut,
    RuntimeAssertionSummaryOut,
    TaskDetailResponse,
    TaskRuntimeOut,
    TaskStatus,
)


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@dataclass
class TaskRecord:
    task_id: str
    created_at: datetime
    status: TaskStatus
    manifest: dict[str, Any]
    mysql: MySQLConnectionIn
    batch_count: int
    completed_batches: int
    current_batch_index: int | None
    rows_inserted_total: int
    last_heartbeat_at: datetime | None
    last_batch_started_at: datetime | None
    row_map_flush_lag: int
    cleanup_state: str
    cleanup_blocked_reason: str | None
    last_error: dict[str, Any] | None
    assertion_runs: list[AssertionRunItemOut]
    assertion_evaluated: bool
    completed_batch_indices: set[int] = field(default_factory=set)
    cleanup_completed_at: datetime | None = None
    cleanup_completed_by: str | None = None
    batch_rows_affected: dict[int, int] = field(default_factory=dict)


_lock = threading.Lock()
_tasks: dict[str, TaskRecord] = {}


def _derive_cleanup_state(rec: TaskRecord) -> tuple[str, str | None]:
    if rec.cleanup_completed_at:
        return "completed", None
    if rec.status == "RUNNING":
        return "blocked", "task_running"
    if rec.row_map_flush_lag > 0:
        return "blocked", "row_map_flush_lag"
    if rec.completed_batches == 0 and rec.status == "PENDING":
        return "not_applicable", None
    return "eligible", None


def create_task(manifest: dict[str, Any], mysql: MySQLConnectionIn) -> TaskRecord:
    task_id = str(uuid.uuid4())
    m = copy.deepcopy(manifest)
    m["task_id"] = task_id
    batching = m["generation"]["batching"]
    batch_count = int(batching["batch_count"])
    rec = TaskRecord(
        task_id=task_id,
        created_at=_utcnow(),
        status="PENDING",
        manifest=m,
        mysql=mysql,
        batch_count=batch_count,
        completed_batches=0,
        current_batch_index=None,
        rows_inserted_total=0,
        last_heartbeat_at=None,
        last_batch_started_at=None,
        row_map_flush_lag=0,
        cleanup_state="not_applicable",
        cleanup_blocked_reason=None,
        last_error=None,
        assertion_runs=[],
        assertion_evaluated=False,
    )
    with _lock:
        _tasks[task_id] = rec
    return rec


def get_task(task_id: str) -> TaskRecord | None:
    with _lock:
        r = _tasks.get(task_id)
        return r


def update_task(task_id: str, fn) -> TaskRecord | None:
    with _lock:
        r = _tasks.get(task_id)
        if not r:
            return None
        fn(r)
        cs, br = _derive_cleanup_state(r)
        r.cleanup_state = cs
        r.cleanup_blocked_reason = br
        return r


def list_tasks(limit: int = 50) -> list[TaskRecord]:
    with _lock:
        items = list(_tasks.values())
    items.sort(key=lambda x: x.created_at, reverse=True)
    return items[:limit]


def to_detail(rec: TaskRecord) -> TaskDetailResponse:
    st, br = _derive_cleanup_state(rec)
    passed = True
    failed: list[str] = []
    if rec.assertion_evaluated:
        for ar in rec.assertion_runs:
            if not ar.passed and ar.assertion_id:
                sev = next(
                    (a.get("severity") for a in rec.manifest.get("assertions", []) if a.get("id") == ar.assertion_id),
                    "error",
                )
                if sev == "error":
                    passed = False
                    failed.append(ar.assertion_id)
    summary = AssertionSummaryOut(evaluated=rec.assertion_evaluated, passed=passed, failed_rules=failed)
    rules = rec.manifest.get("assertions") or []
    total_rules = len(rules) if isinstance(rules, list) else 0
    passed_n = (
        sum(1 for ar in rec.assertion_runs if ar.passed) if rec.assertion_evaluated else 0
    )
    bp = BatchProgressOut(
        batch_count=rec.batch_count,
        completed_batches=rec.completed_batches,
        current_batch_index=rec.current_batch_index,
        rows_inserted_total=rec.rows_inserted_total,
    )
    cst = CleanupStatusOut(state=st, blocked_reason=br)
    runtime = TaskRuntimeOut(
        batch_progress=bp,
        last_heartbeat_at=rec.last_heartbeat_at,
        last_batch_started_at=rec.last_batch_started_at,
        cleanup_status=cst,
        assertion_summary=RuntimeAssertionSummaryOut(total=total_rules, passed=passed_n),
    )
    return TaskDetailResponse(
        task_id=rec.task_id,
        status=rec.status,
        manifest=rec.manifest,
        batch_progress=bp,
        last_heartbeat_at=rec.last_heartbeat_at,
        last_batch_started_at=rec.last_batch_started_at,
        assertion_summary=summary,
        assertion_runs=list(rec.assertion_runs),
        cleanup_status=cst,
        row_map_flush_lag=rec.row_map_flush_lag,
        last_error=rec.last_error,
        runtime=runtime,
    )
