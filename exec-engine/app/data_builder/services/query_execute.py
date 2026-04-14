from __future__ import annotations

from typing import Any

from app.data_builder.schemas.query import QueryExecuteIn, QueryExecuteOut
from app.data_builder.services import mysql_meta
from app.data_builder.services.sql_guard import append_limit_if_missing, validate_ai_select_sql


def execute_readonly_query(body: QueryExecuteIn) -> QueryExecuteOut:
    database = mysql_meta.require_database_name(body.database)
    stmt = validate_ai_select_sql(body.sql)
    capped = append_limit_if_missing(stmt, body.max_rows + 1)

    conn = mysql_meta.mysql_connect(
        body,
        connect_timeout=min(10, body.timeout_seconds),
        read_timeout=body.timeout_seconds,
        write_timeout=body.timeout_seconds,
    )
    try:
        with conn.cursor() as cur:
            cur.execute(f"USE `{database}`")
            cur.execute(capped)
            desc = cur.description
            raw_rows = cur.fetchmany(body.max_rows + 1) or []
    finally:
        conn.close()

    truncated = len(raw_rows) > body.max_rows
    rows_out = raw_rows[: body.max_rows]
    columns: list[str] = []
    if rows_out:
        columns = [str(k) for k in rows_out[0].keys()]
    elif desc:
        columns = [d[0] for d in desc if d and d[0]]

    normalized: list[dict[str, Any]] = []
    for r in rows_out:
        row: dict[str, Any] = {}
        for k, v in r.items():
            key = str(k)
            if hasattr(v, "isoformat"):
                try:
                    row[key] = v.isoformat()
                except Exception:
                    row[key] = v
            else:
                row[key] = v
        normalized.append(row)

    return QueryExecuteOut(
        columns=columns,
        rows=normalized,
        truncated=truncated,
        row_count=len(normalized),
    )
