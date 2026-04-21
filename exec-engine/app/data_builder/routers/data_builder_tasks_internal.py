"""Internal stateless task execution routes reserved for mgmt-api orchestration."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Header, HTTPException

from app.data_builder.routers.task_route_common import (
    assert_mysql_matches_manifest,
    raise_exec_error,
    require_internal_token,
)
from app.data_builder.schemas.tasks import (
    CleanupResponse,
    InternalCleanupBody,
    InternalExecuteBatchBody,
    InternalExecuteBatchResponse,
)
from app.data_builder.services import mysql_meta
from app.data_builder.services.cleanup_service import run_cleanup_payload
from app.data_builder.services.manifest_validate import validate_manifest
from app.data_builder.services.task_batch_execute import BatchIndexOutOfRange, execute_batch_payload

INTERNAL_ROUTE_DESCRIPTION = (
    "Internal-only stateless execution route. Reserved for mgmt-api -> exec-engine calls in "
    "db_primary mode and protected by x-data-builder-internal-token."
)

router = APIRouter(prefix="/data-builder", tags=["data-builder-tasks-internal"])


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


@router.post(
    "/internal/execute-batch",
    response_model=InternalExecuteBatchResponse,
    description=INTERNAL_ROUTE_DESCRIPTION,
)
def http_execute_batch_internal(
    body: InternalExecuteBatchBody,
    x_data_builder_internal_token: str | None = Header(default=None, alias="x-data-builder-internal-token"),
) -> InternalExecuteBatchResponse:
    require_internal_token(x_data_builder_internal_token)
    assert_mysql_matches_manifest(body.mysql, body.manifest)
    try:
        validate_manifest(body.manifest)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_TASK_MANIFEST_INVALID", "message": str(exc)},
        ) from exc
    try:
        return execute_batch_payload(
            body.task_id,
            body.manifest,
            body.mysql,
            body.batch_index,
            dry_run=body.dry_run,
        )
    except BatchIndexOutOfRange as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_TASK_BATCH_OUT_OF_RANGE", "message": str(exc)},
        ) from exc
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_TASK_EXEC_INVALID", "message": str(exc)},
        ) from exc
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        raise_exec_error(exc)


@router.post("/internal/cleanup", response_model=CleanupResponse, description=INTERNAL_ROUTE_DESCRIPTION)
def http_cleanup_internal(
    body: InternalCleanupBody,
    x_data_builder_internal_token: str | None = Header(default=None, alias="x-data-builder-internal-token"),
) -> CleanupResponse:
    require_internal_token(x_data_builder_internal_token)
    if not body.confirm:
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_CLEAN_CONFIRM_REQUIRED", "message": "confirm=true is required"},
        )
    assert_mysql_matches_manifest(body.mysql, body.manifest)
    try:
        validate_manifest(body.manifest)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=400,
            detail={"code": "DB_TASK_MANIFEST_INVALID", "message": str(exc)},
        ) from exc

    timeout = 120
    conn = None
    try:
        conn = mysql_meta.mysql_connect(
            body.mysql,
            connect_timeout=min(10, timeout),
            read_timeout=timeout,
            write_timeout=timeout,
        )
        conn.autocommit(True)
        deleted, mode = run_cleanup_payload(conn, task_id=body.task_id, manifest=body.manifest)
        return CleanupResponse(
            task_id=body.task_id,
            deleted_by_table=deleted,
            mode_used=mode,
            cleanup_completed_at=_utcnow(),
            cleanup_completed_by=body.actor,
            idempotent_replay=False,
        )
    except HTTPException:
        raise
    except TypeError as exc:
        raise HTTPException(
            status_code=502,
            detail={"code": "DB_CLEANUP_ROW_MAP_PARSE", "message": str(exc)},
        ) from exc
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
