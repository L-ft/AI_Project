"""Deprecated legacy task lifecycle routes kept only for direct-mode fallback."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.data_builder.routers.task_route_common import assert_mysql_matches_manifest, raise_exec_error
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
from app.data_builder.services.cleanup_service import run_cleanup
from app.data_builder.services.manifest_validate import validate_manifest
from app.data_builder.services.task_batch_execute import BatchIndexOutOfRange, execute_batch
from app.data_builder.services.task_store import TaskRecord, create_task, get_task, list_tasks, to_detail, update_task

LEGACY_ROUTE_DESCRIPTION = (
    "Deprecated compatibility route. External callers should use mgmt-api task APIs. "
    "This exec-engine lifecycle surface remains only as a direct-mode/proxy fallback."
)

router = APIRouter(prefix="/data-builder", tags=["data-builder-tasks-legacy"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@router.get("/tasks", response_model=list[TaskDetailResponse], deprecated=True, description=LEGACY_ROUTE_DESCRIPTION)
def http_list_tasks(limit: int = 50) -> list[TaskDetailResponse]:
    return [to_detail(record) for record in list_tasks(min(limit, 200))]


@router.post(
    "/tasks",
    response_model=CreateTaskResponse,
    status_code=201,
    deprecated=True,
    description=LEGACY_ROUTE_DESCRIPTION,
)
def http_create_task(body: CreateDataBuilderTaskBody) -> CreateTaskResponse:
    assert_mysql_matches_manifest(body.mysql, body.manifest)
    try:
        validate_manifest(body.manifest)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_TASK_MANIFEST_INVALID", "message": str(exc)},
        ) from exc

    rec = create_task(body.manifest, body.mysql)
    return CreateTaskResponse(task_id=rec.task_id, status=rec.status, manifest=rec.manifest)


@router.get(
    "/tasks/{task_id}",
    response_model=TaskDetailResponse,
    deprecated=True,
    description=LEGACY_ROUTE_DESCRIPTION,
)
def http_get_task(task_id: str) -> TaskDetailResponse:
    rec = get_task(task_id)
    if not rec:
        raise HTTPException(status_code=404, detail={"code": "DB_TASK_NOT_FOUND", "message": task_id})
    return to_detail(rec)


@router.post(
    "/tasks/{task_id}/execute-batch",
    response_model=ExecuteBatchResponse,
    deprecated=True,
    description=LEGACY_ROUTE_DESCRIPTION,
)
def http_execute_batch(task_id: str, body: ExecuteBatchBody) -> ExecuteBatchResponse:
    if not get_task(task_id):
        raise HTTPException(status_code=404, detail={"code": "DB_TASK_NOT_FOUND", "message": task_id})
    try:
        return execute_batch(task_id, body.batch_index, dry_run=body.dry_run)
    except KeyError:
        raise HTTPException(status_code=404, detail={"code": "DB_TASK_NOT_FOUND", "message": task_id}) from None
    except BatchIndexOutOfRange as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_TASK_BATCH_OUT_OF_RANGE", "message": str(exc)},
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=409,
            detail={"code": "DB_TASK_STATE_CONFLICT", "message": str(exc)},
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_TASK_EXEC_INVALID", "message": str(exc)},
        ) from exc
    except Exception as exc:  # noqa: BLE001
        raise_exec_error(exc)


@router.post(
    "/tasks/{task_id}/cleanup",
    response_model=CleanupResponse,
    deprecated=True,
    description=LEGACY_ROUTE_DESCRIPTION,
)
def http_cleanup(task_id: str, body: CleanupBody) -> CleanupResponse:
    rec = get_task(task_id)
    if not rec:
        raise HTTPException(status_code=404, detail={"code": "DB_TASK_NOT_FOUND", "message": task_id})
    if not body.confirm:
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_CLEAN_CONFIRM_REQUIRED", "message": "confirm=true is required"},
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
            detail={"code": "DB_CLEAN_FORBIDDEN_WHILE_RUNNING", "message": "task is RUNNING"},
        )

    timeout = 120
    conn = None
    try:
        conn = mysql_meta.mysql_connect(
            rec.mysql,
            connect_timeout=min(10, timeout),
            read_timeout=timeout,
            write_timeout=timeout,
        )
        conn.autocommit(True)
        try:
            deleted, mode = run_cleanup(conn, rec)
        except TypeError as exc:
            raise HTTPException(
                status_code=502,
                detail={"code": "DB_CLEANUP_ROW_MAP_PARSE", "message": str(exc)},
            ) from exc

        def mark_done(record: TaskRecord) -> None:
            record.cleanup_completed_at = _utcnow()
            record.cleanup_completed_by = body.actor

        update_task(task_id, mark_done)
        fin = get_task(task_id)
        return CleanupResponse(
            task_id=task_id,
            deleted_by_table=deleted,
            mode_used=mode,
            cleanup_completed_at=fin.cleanup_completed_at if fin else None,
            cleanup_completed_by=fin.cleanup_completed_by if fin else body.actor,
            idempotent_replay=False,
        )
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_CLEANUP_INVALID", "message": str(exc)},
        ) from exc
    except Exception as exc:  # noqa: BLE001
        raise_exec_error(exc)
    finally:
        if conn is not None:
            conn.close()
