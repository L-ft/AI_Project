"""L3 任务 API：与 docs/data-builder/openapi_core.yaml 对齐（exec-engine 实现 + mysql 连接体扩展）。"""

from __future__ import annotations

from datetime import datetime, timezone

import pymysql
from fastapi import APIRouter, HTTPException

from app.data_builder.schemas.tasks import (
    CleanupBody,
    CleanupResponse,
    CreateDataBuilderTaskBody,
    CreateTaskResponse,
    ExecuteBatchBody,
    ExecuteBatchResponse,
    TaskDetailResponse,
)
from app.data_builder.services import mysql_meta
from app.data_builder.services.cleanup_runner import run_cleanup
from app.data_builder.services.manifest_validate import validate_manifest
from app.data_builder.services.task_batch_execute import execute_batch
from app.data_builder.services.task_store import TaskRecord, create_task, get_task, list_tasks, to_detail, update_task

router = APIRouter(prefix="/data-builder", tags=["data-builder-tasks"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@router.get("/tasks", response_model=list[TaskDetailResponse])
def http_list_tasks(limit: int = 50) -> list[TaskDetailResponse]:
    return [to_detail(r) for r in list_tasks(min(limit, 200))]


@router.post("/tasks", response_model=CreateTaskResponse, status_code=201)
def http_create_task(body: CreateDataBuilderTaskBody) -> CreateTaskResponse:
    mdb = body.mysql.database.strip()
    ddb = str(body.manifest.get("database_context", {}).get("database", "")).strip()
    if mdb and ddb and mdb != ddb:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "DB_TASK_MANIFEST_INVALID",
                "message": f"mysql.database ({mdb}) 与 manifest.database_context.database ({ddb}) 不一致",
            },
        )
    try:
        validate_manifest(body.manifest)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_TASK_MANIFEST_INVALID", "message": str(exc)},
        ) from exc
    rec = create_task(body.manifest, body.mysql)
    return CreateTaskResponse(task_id=rec.task_id, status=rec.status, manifest=rec.manifest)


@router.get("/tasks/{task_id}", response_model=TaskDetailResponse)
def http_get_task(task_id: str) -> TaskDetailResponse:
    rec = get_task(task_id)
    if not rec:
        raise HTTPException(status_code=404, detail={"code": "DB_TASK_NOT_FOUND", "message": task_id})
    return to_detail(rec)


@router.post("/tasks/{task_id}/execute-batch", response_model=ExecuteBatchResponse)
def http_execute_batch(task_id: str, body: ExecuteBatchBody) -> ExecuteBatchResponse:
    if not get_task(task_id):
        raise HTTPException(status_code=404, detail={"code": "DB_TASK_NOT_FOUND", "message": task_id})
    try:
        return execute_batch(task_id, body.batch_index, dry_run=body.dry_run)
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "DB_TASK_NOT_FOUND", "message": task_id}) from None
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_TASK_BATCH_OUT_OF_RANGE", "message": str(exc)},
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=409,
            detail={"code": "DB_TASK_STATE_CONFLICT", "message": str(exc)},
        ) from exc


@router.post("/tasks/{task_id}/cleanup", response_model=CleanupResponse)
def http_cleanup(task_id: str, body: CleanupBody) -> CleanupResponse:
    rec = get_task(task_id)
    if not rec:
        raise HTTPException(status_code=404, detail={"code": "DB_TASK_NOT_FOUND", "message": task_id})
    if not body.confirm:
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_CLEAN_CONFIRM_REQUIRED", "message": "confirm=true 后方可清理"},
        )
    if rec.cleanup_completed_at:
        return CleanupResponse(
            task_id=task_id,
            deleted_by_table={},
            mode_used=None,
            cleanup_completed_at=rec.cleanup_completed_at,
            cleanup_completed_by=rec.cleanup_completed_by,
            idempotent_replay=True,
        )
    if rec.status == "RUNNING":
        raise HTTPException(
            status_code=409,
            detail={"code": "DB_CLEAN_FORBIDDEN_WHILE_RUNNING", "message": "任务 RUNNING 中禁止清理"},
        )

    timeout = 120
    try:
        conn = mysql_meta.mysql_connect(
            rec.mysql,
            connect_timeout=min(10, timeout),
            read_timeout=timeout,
            write_timeout=timeout,
        )
    except pymysql.Error as exc:
        raise HTTPException(
            status_code=502,
            detail={"code": "DB_CLEANUP_CONNECT_FAILED", "message": str(exc)},
        ) from exc
    try:
        conn.autocommit(True)
        try:
            deleted, mode = run_cleanup(conn, rec)
        except pymysql.Error as exc:
            raise HTTPException(
                status_code=502,
                detail={"code": "DB_CLEANUP_DB_ERROR", "message": str(exc)},
            ) from exc
        except TypeError as exc:
            raise HTTPException(
                status_code=502,
                detail={"code": "DB_CLEANUP_ROW_MAP_PARSE", "message": str(exc)},
            ) from exc

        def mark_done(r: TaskRecord) -> None:
            r.cleanup_completed_at = _utcnow()
            r.cleanup_completed_by = body.actor

        update_task(task_id, mark_done)
        fin = get_task(task_id)
        return CleanupResponse(
            task_id=task_id,
            deleted_by_table=deleted,
            mode_used=mode,  # type: ignore[arg-type]
            cleanup_completed_at=fin.cleanup_completed_at if fin else None,
            cleanup_completed_by=fin.cleanup_completed_by if fin else body.actor,
            idempotent_replay=False,
        )
    finally:
        conn.close()
