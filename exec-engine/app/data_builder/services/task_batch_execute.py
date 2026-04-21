from __future__ import annotations

import random
import re
import threading
import uuid
from datetime import datetime, timezone
from typing import Any

from app.data_builder.schemas.mysql import MySQLConnectionIn
from app.data_builder.schemas.tasks import (
    AssertionRunItemOut,
    AssertionSummaryOut,
    ExecuteBatchResponse,
    InternalExecuteBatchResponse,
)
from app.data_builder.services.assertion_runner import run_assertions
from app.data_builder.services.binding_row_gen import (
    batch_row_count,
    build_placeholder_values,
    expand_named_sql,
    resolve_task_marker,
)
from app.data_builder.services.data_builder_sidecar import ensure_row_map_table
from app.data_builder.services import mysql_meta
from app.data_builder.services.sql_guard import validate_write_sql
from app.data_builder.services.task_store import TaskRecord, get_task, update_task

_INSERT_TABLE_RE = re.compile(r"(?is)insert\s+into\s+`([^`]+)`")

_per_task_exec_locks: dict[str, threading.Lock] = {}
_per_task_locks_guard = threading.Lock()


class BatchIndexOutOfRange(ValueError):
    pass


def _exec_lock(task_id: str) -> threading.Lock:
    with _per_task_locks_guard:
        if task_id not in _per_task_exec_locks:
            _per_task_exec_locks[task_id] = threading.Lock()
        return _per_task_exec_locks[task_id]


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _parse_insert_table(template: str) -> str:
    m = _INSERT_TABLE_RE.search(template)
    if not m:
        raise ValueError("sql_template 须为 INSERT INTO `表名` … 形式以便解析表名")
    return m.group(1)


def _pk_column(manifest: dict[str, Any]) -> str:
    meta = manifest.get("meta") or {}
    inner = meta.get("data_builder") or {}
    return str(inner.get("insert_pk_column", "id"))


def _insert_row_map(
    cur,
    *,
    task_id: str,
    db_name: str,
    table: str,
    pk_col: str,
    pk_val: Any,
    batch_index: int,
    row_index: int,
) -> None:
    import json

    cur.execute(
        """
        INSERT INTO data_builder_row_map
        (task_id, db_name, table_name, pk_columns, pk_values, batch_index, row_index)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            task_id,
            db_name,
            table,
            json.dumps([pk_col], ensure_ascii=False),
            json.dumps([pk_val], ensure_ascii=False, default=str),
            batch_index,
            row_index,
        ),
    )


def _summary_from_runs(
    manifest: dict[str, Any],
    assertion_evaluated: bool,
    assertion_runs: list[AssertionRunItemOut],
) -> AssertionSummaryOut:
    passed = True
    failed: list[str] = []
    if assertion_evaluated:
        for ar in assertion_runs:
            if ar.passed:
                continue
            sev = next(
                (
                    a.get("severity", "error")
                    for a in manifest.get("assertions", [])
                    if a.get("id") == ar.assertion_id
                ),
                "error",
            )
            if sev == "error":
                passed = False
                failed.append(ar.assertion_id)
    return AssertionSummaryOut(evaluated=assertion_evaluated, passed=passed, failed_rules=failed)


def _summary_from_record(rec: TaskRecord) -> AssertionSummaryOut:
    return _summary_from_runs(rec.manifest, rec.assertion_evaluated, rec.assertion_runs)


def _batch_count(manifest: dict[str, Any]) -> int:
    return int(manifest["generation"]["batching"]["batch_count"])


def execute_batch_payload(
    task_id: str,
    manifest: dict[str, Any],
    mysql: MySQLConnectionIn,
    batch_index: int,
    dry_run: bool = False,
) -> InternalExecuteBatchResponse:
    batch_count = _batch_count(manifest)
    if batch_index < 0 or batch_index >= batch_count:
        raise BatchIndexOutOfRange("batch_index out of range")

    db_name = mysql_meta.require_database_name(manifest["database_context"]["database"])
    template = manifest["generation"]["sql_template"]
    bindings = manifest["generation"]["bindings"]
    target_table = _parse_insert_table(template)
    marker = resolve_task_marker(manifest, task_id)
    n_rows = batch_row_count(manifest, batch_index)
    pk_col = _pk_column(manifest)
    rng = random.Random(int(uuid.UUID(task_id).int % (2**48)) + batch_index * 10_001)
    timeout = 120

    if dry_run:
        conn_d = mysql_meta.mysql_connect(
            mysql,
            connect_timeout=min(10, timeout),
            read_timeout=timeout,
            write_timeout=timeout,
        )
        try:
            conn_d.autocommit(True)
            with conn_d.cursor() as cur:
                cur.execute(f"USE `{db_name}`")
                values = build_placeholder_values(
                    bindings,
                    task_marker=marker,
                    batch_index=batch_index,
                    row_index=0,
                    rng=rng,
                )
                sql = expand_named_sql(conn_d, template, values)
                validate_write_sql(sql)
            return InternalExecuteBatchResponse(
                task_id=task_id,
                status="PENDING",
                batch_index=batch_index,
                rows_affected=0,
                assertions_evaluated=False,
                assertion_summary=None,
                assertion_runs=[],
            )
        finally:
            conn_d.close()

    rows_affected = 0
    conn = mysql_meta.mysql_connect(
        mysql,
        connect_timeout=min(10, timeout),
        read_timeout=timeout,
        write_timeout=timeout,
    )
    try:
        conn.autocommit(True)
        with conn.cursor() as cur:
            cur.execute(f"USE `{db_name}`")
            for ri in range(n_rows):
                values = build_placeholder_values(
                    bindings,
                    task_marker=marker,
                    batch_index=batch_index,
                    row_index=ri,
                    rng=rng,
                )
                sql = expand_named_sql(conn, template, values)
                stmt = validate_write_sql(sql)
                if ri == 0:
                    ensure_row_map_table(cur)
                cur.execute(stmt)
                rows_affected += int(cur.rowcount or 0)
                lid = getattr(cur, "lastrowid", None)
                if lid:
                    _insert_row_map(
                        cur,
                        task_id=task_id,
                        db_name=db_name,
                        table=target_table,
                        pk_col=pk_col,
                        pk_val=int(lid) if isinstance(lid, int) else lid,
                        batch_index=batch_index,
                        row_index=ri,
                    )

        final = batch_index == batch_count - 1
        if not final:
            return InternalExecuteBatchResponse(
                task_id=task_id,
                status="RUNNING",
                batch_index=batch_index,
                rows_affected=rows_affected,
                assertions_evaluated=False,
                assertion_summary=None,
                assertion_runs=[],
            )

        with conn.cursor() as cur:
            cur.execute(f"USE `{db_name}`")
            assertion_runs = run_assertions(cur, conn, manifest=manifest, task_id=task_id)
        assertion_summary = _summary_from_runs(manifest, True, assertion_runs)
        return InternalExecuteBatchResponse(
            task_id=task_id,
            status="COMPLETED_OK" if assertion_summary.passed else "FAILED_ASSERTION",
            batch_index=batch_index,
            rows_affected=rows_affected,
            assertions_evaluated=True,
            assertion_summary=assertion_summary,
            assertion_runs=assertion_runs,
        )
    finally:
        conn.close()


def execute_batch(task_id: str, batch_index: int, dry_run: bool = False) -> ExecuteBatchResponse:
    lk = _exec_lock(task_id)
    with lk:
        rec = get_task(task_id)
        if not rec:
            raise KeyError("task not found")
        if rec.status == "FAILED_EXECUTION":
            raise RuntimeError("task in FAILED_EXECUTION state")
        if batch_index < 0 or batch_index >= rec.batch_count:
            raise BatchIndexOutOfRange("batch_index out of range")

        if batch_index in rec.completed_batch_indices:
            cur = get_task(task_id)
            assert cur is not None
            return ExecuteBatchResponse(
                task_id=task_id,
                status=cur.status,
                batch_index=batch_index,
                rows_affected=cur.batch_rows_affected.get(batch_index, 0),
                assertions_evaluated=cur.assertion_evaluated,
                assertion_summary=_summary_from_record(cur) if cur.assertion_evaluated else None,
            )

        manifest = rec.manifest
        db_name = mysql_meta.require_database_name(manifest["database_context"]["database"])
        template = manifest["generation"]["sql_template"]
        bindings = manifest["generation"]["bindings"]
        target_table = _parse_insert_table(template)
        marker = resolve_task_marker(manifest, task_id)
        n_rows = batch_row_count(manifest, batch_index)
        pk_col = _pk_column(manifest)
        rng = random.Random(int(uuid.UUID(task_id).int % (2**48)) + batch_index * 10_001)
        timeout = 120

        if dry_run:
            conn_d = mysql_meta.mysql_connect(
                rec.mysql,
                connect_timeout=min(10, timeout),
                read_timeout=timeout,
                write_timeout=timeout,
            )
            try:
                conn_d.autocommit(True)
                with conn_d.cursor() as cur:
                    cur.execute(f"USE `{db_name}`")
                    values = build_placeholder_values(
                        bindings,
                        task_marker=marker,
                        batch_index=batch_index,
                        row_index=0,
                        rng=rng,
                    )
                    sql = expand_named_sql(conn_d, template, values)
                    validate_write_sql(sql)
                snap = get_task(task_id)
                assert snap is not None
                return ExecuteBatchResponse(
                    task_id=task_id,
                    status=snap.status,
                    batch_index=batch_index,
                    rows_affected=0,
                    assertions_evaluated=False,
                    assertion_summary=None,
                )
            finally:
                conn_d.close()

        def set_started(r: TaskRecord) -> None:
            r.last_batch_started_at = _utcnow()
            if r.status == "PENDING":
                r.status = "RUNNING"

        update_task(task_id, set_started)

        rows_affected = 0
        conn = mysql_meta.mysql_connect(
            rec.mysql,
            connect_timeout=min(10, timeout),
            read_timeout=timeout,
            write_timeout=timeout,
        )
        try:
            conn.autocommit(True)
            with conn.cursor() as cur:
                cur.execute(f"USE `{db_name}`")
                for ri in range(n_rows):
                    values = build_placeholder_values(
                        bindings,
                        task_marker=marker,
                        batch_index=batch_index,
                        row_index=ri,
                        rng=rng,
                    )
                    sql = expand_named_sql(conn, template, values)
                    stmt = validate_write_sql(sql)
                    if ri == 0:
                        ensure_row_map_table(cur)
                    cur.execute(stmt)
                    rows_affected += int(cur.rowcount or 0)
                    lid = getattr(cur, "lastrowid", None)
                    if lid:
                        _insert_row_map(
                            cur,
                            task_id=task_id,
                            db_name=db_name,
                            table=target_table,
                            pk_col=pk_col,
                            pk_val=int(lid) if isinstance(lid, int) else lid,
                            batch_index=batch_index,
                            row_index=ri,
                        )

            def on_success(r: TaskRecord) -> None:
                r.last_heartbeat_at = _utcnow()
                r.completed_batch_indices.add(batch_index)
                r.completed_batches = len(r.completed_batch_indices)
                r.current_batch_index = batch_index
                r.rows_inserted_total += rows_affected
                r.batch_rows_affected[batch_index] = rows_affected
                r.last_error = None

            update_task(task_id, on_success)

            assertions_evaluated = False
            assertion_summary: AssertionSummaryOut | None = None
            final = batch_index == rec.batch_count - 1
            if final:
                with conn.cursor() as cur:
                    cur.execute(f"USE `{db_name}`")
                    runs = run_assertions(cur, conn, manifest=manifest, task_id=task_id)

                def finalize(r: TaskRecord) -> None:
                    r.assertion_runs = runs
                    r.assertion_evaluated = True
                    failed = any(
                        not x.passed
                        and next(
                            (
                                a.get("severity", "error")
                                for a in r.manifest.get("assertions", [])
                                if a.get("id") == x.assertion_id
                            ),
                            "error",
                        )
                        == "error"
                        for x in runs
                    )
                    r.status = "FAILED_ASSERTION" if failed else "COMPLETED_OK"

                update_task(task_id, finalize)
                assertions_evaluated = True
                fin = get_task(task_id)
                assertion_summary = _summary_from_record(fin) if fin else None

            out = get_task(task_id)
            assert out is not None
            return ExecuteBatchResponse(
                task_id=task_id,
                status=out.status,
                batch_index=batch_index,
                rows_affected=rows_affected,
                assertions_evaluated=assertions_evaluated,
                assertion_summary=assertion_summary,
            )
        except Exception as exc:
            msg = mysql_meta.normalize_mysql_error(exc)

            def on_fail(r: TaskRecord) -> None:
                r.status = "FAILED_EXECUTION"
                r.last_error = {"code": "DB_EXEC_UNKNOWN", "message": msg, "details": {}}

            update_task(task_id, on_fail)
            raise
        finally:
            conn.close()
