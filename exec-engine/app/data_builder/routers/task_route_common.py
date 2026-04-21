from __future__ import annotations

import os

from fastapi import HTTPException

from app.data_builder.services import mysql_meta


def require_internal_token(token: str | None) -> None:
    expected = os.getenv("DATA_BUILDER_EXEC_INTERNAL_TOKEN", "").strip()
    if not expected:
        raise HTTPException(
            status_code=503,
            detail={
                "code": "DB_INTERNAL_DISABLED",
                "message": "DATA_BUILDER_EXEC_INTERNAL_TOKEN is not configured",
            },
        )
    if token != expected:
        raise HTTPException(
            status_code=403,
            detail={"code": "DB_INTERNAL_FORBIDDEN", "message": "invalid internal token"},
        )


def assert_mysql_matches_manifest(mysql, manifest: dict) -> None:
    mdb = mysql.database.strip()
    ddb = str(manifest.get("database_context", {}).get("database", "")).strip()
    if mdb and ddb and mdb != ddb:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "DB_TASK_MANIFEST_INVALID",
                "message": f"mysql.database ({mdb}) != manifest.database_context.database ({ddb})",
            },
        )


def raise_exec_error(exc: Exception) -> None:
    msg = mysql_meta.normalize_mysql_error(exc)
    raise HTTPException(
        status_code=502,
        detail={"code": "DB_EXEC_UNKNOWN", "message": msg, "details": {}},
    ) from exc
