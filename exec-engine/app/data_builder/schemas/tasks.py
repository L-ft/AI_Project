"""Pydantic models for L3 task APIs (aligned with docs/data-builder/openapi_core.yaml)."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

from app.data_builder.schemas.mysql import MySQLConnectionIn

TaskStatus = Literal["PENDING", "RUNNING", "COMPLETED_OK", "FAILED_ASSERTION", "FAILED_EXECUTION"]
CleanupState = Literal["not_applicable", "eligible", "completed", "blocked"]


class CreateDataBuilderTaskBody(BaseModel):
    """exec-engine 扩展：除 manifest 外需携带目标 MySQL（合同 connection_ref 的运行时解析）。"""

    manifest: dict[str, Any]
    mysql: MySQLConnectionIn


class CreateTaskResponse(BaseModel):
    task_id: str
    status: TaskStatus
    manifest: dict[str, Any]


class BatchProgressOut(BaseModel):
    batch_count: int
    completed_batches: int
    current_batch_index: int | None
    rows_inserted_total: int = 0


class CleanupStatusOut(BaseModel):
    state: CleanupState
    blocked_reason: str | None = None


class AssertionSummaryOut(BaseModel):
    evaluated: bool
    passed: bool
    failed_rules: list[str] = Field(default_factory=list)


class RuntimeAssertionSummaryOut(BaseModel):
    """轮询用计数：total=规则条数，passed=已通过条数（未跑断言前为 0）。"""

    total: int = 0
    passed: int = 0


class TaskRuntimeOut(BaseModel):
    batch_progress: BatchProgressOut
    last_heartbeat_at: datetime | None = None
    last_batch_started_at: datetime | None = None
    cleanup_status: CleanupStatusOut
    assertion_summary: RuntimeAssertionSummaryOut


class AssertionRunItemOut(BaseModel):
    assertion_id: str
    assertion_type: Literal["scalar", "rowset"] = "scalar"
    passed: bool
    actual: Any | None = None
    expect: Any | None = None
    error_code: str | None = None
    message: str | None = None
    primary_key_columns: list[str] | None = None
    sample_rows: list[dict[str, Any]] | None = None
    truncated: bool = False


class TaskDetailResponse(BaseModel):
    task_id: str
    status: TaskStatus
    manifest: dict[str, Any]
    batch_progress: BatchProgressOut
    last_heartbeat_at: datetime | None = None
    last_batch_started_at: datetime | None = None
    assertion_summary: AssertionSummaryOut
    assertion_runs: list[AssertionRunItemOut] = Field(default_factory=list)
    cleanup_status: CleanupStatusOut
    row_map_flush_lag: int = 0
    last_error: dict[str, Any] | None = None
    runtime: TaskRuntimeOut


class ExecuteBatchBody(BaseModel):
    batch_index: int = Field(..., ge=0)
    dry_run: bool = False


class ExecuteBatchResponse(BaseModel):
    task_id: str
    status: TaskStatus
    batch_index: int
    rows_affected: int
    assertions_evaluated: bool = False
    assertion_summary: AssertionSummaryOut | None = None


class InternalExecuteBatchBody(BaseModel):
    task_id: str = Field(..., min_length=1)
    manifest: dict[str, Any]
    mysql: MySQLConnectionIn
    batch_index: int = Field(..., ge=0)
    dry_run: bool = False


class InternalExecuteBatchResponse(ExecuteBatchResponse):
    assertion_runs: list[AssertionRunItemOut] = Field(default_factory=list)


class CleanupBody(BaseModel):
    confirm: bool = False
    actor: str | None = None


class CleanupResponse(BaseModel):
    task_id: str
    deleted_by_table: dict[str, int]
    mode_used: Literal["predicate", "row_map", "hybrid"] | None = None
    cleanup_completed_at: datetime | None = None
    cleanup_completed_by: str | None = None
    idempotent_replay: bool = False


class InternalCleanupBody(BaseModel):
    task_id: str = Field(..., min_length=1)
    manifest: dict[str, Any]
    mysql: MySQLConnectionIn
    confirm: bool = False
    actor: str | None = None
