from __future__ import annotations

import json
import re
from typing import Any

from app.data_builder.schemas.tasks import AssertionRunItemOut
from app.data_builder.services.binding_row_gen import resolve_task_marker
from app.data_builder.services.orchestrate_execute import _normalize_rows
from app.data_builder.services.sql_guard import append_limit_if_missing, normalize_sql, validate_ai_select_sql


def _escape_marker(conn: Any, marker: str) -> str:
    esc = conn.escape(marker)
    if isinstance(esc, (bytes, bytearray)):
        return esc.decode(conn.charset or "utf8", errors="replace")
    return str(esc)


def _inject_marker(sql: str, marker_sql: str) -> str:
    return sql.replace(":task_marker", marker_sql)


def normalize_rowset_sql(sql: str) -> str:
    s = normalize_sql(sql)
    if re.search(r"(?is)\blimit\s+(\d+)\s*$", s):
        m = re.search(r"(?is)\blimit\s+(\d+)\s*$", s)
        if m and int(m.group(1)) > 20:
            return s[: m.start()].rstrip() + " LIMIT 20"
        return s
    return append_limit_if_missing(s, 20)


def _select_columns(sql: str) -> list[str]:
    text = sql.strip()
    m = re.match(r"(?is)select\s+(.*?)\s+from\b", text)
    if not m:
        return []
    inner = m.group(1)
    cols: list[str] = []
    for p in inner.split(","):
        p = p.strip()
        if not p:
            continue
        pm = re.match(r"^`([^`]+)`", p)
        if pm:
            cols.append(pm.group(1))
            continue
        pm = re.match(r"^(\w+)", p)
        if pm:
            cols.append(pm.group(1))
    return cols


def run_assertions(
    cur,
    conn,
    *,
    manifest: dict[str, Any],
    task_id: str,
) -> list[AssertionRunItemOut]:
    marker = resolve_task_marker(manifest, task_id)
    marker_sql = _escape_marker(conn, marker)
    runs: list[AssertionRunItemOut] = []

    for rule in manifest.get("assertions") or []:
        rid = str(rule.get("id", ""))
        at = rule.get("assertion_type") or "scalar"
        raw_sql = str(rule.get("sql", ""))
        sql = _inject_marker(raw_sql, marker_sql)
        expect = rule.get("expect") or {}
        kind = expect.get("kind")

        try:
            if at == "rowset":
                sql_exec = normalize_rowset_sql(sql)
                stmt = validate_ai_select_sql(sql_exec)
                for pk in rule.get("primary_key_columns") or []:
                    if pk not in _select_columns(stmt):
                        raise ValueError(f"rowset SELECT 缺少主键列 `{pk}`")
                cur.execute(stmt)
                rows = cur.fetchall() or []
                normalized_cols, normalized_rows = _normalize_rows(list(rows), cur.description)
                ok = len(normalized_rows) == 0 and kind == "rowset_empty"
                runs.append(
                    AssertionRunItemOut(
                        assertion_id=rid,
                        assertion_type="rowset",
                        passed=ok,
                        actual=len(normalized_rows),
                        expect=expect,
                        error_code=None if ok else "DB_AST_EXPECTATION_MISMATCH",
                        primary_key_columns=list(rule.get("primary_key_columns") or []),
                        sample_rows=None if ok else normalized_rows,
                        truncated=False,
                    )
                )
            else:
                stmt = validate_ai_select_sql(sql)
                cur.execute(stmt)
                row = cur.fetchone()
                if not row:
                    runs.append(
                        AssertionRunItemOut(
                            assertion_id=rid,
                            assertion_type="scalar",
                            passed=False,
                            actual=None,
                            expect=expect,
                            error_code="DB_AST_RUNTIME_ERROR",
                        )
                    )
                    continue
                col = expect.get("column")
                if col and col in row:
                    val = row[col]
                else:
                    val = next(iter(row.values()))
                ok = _scalar_expect(kind, val, expect)
                runs.append(
                    AssertionRunItemOut(
                        assertion_id=rid,
                        assertion_type="scalar",
                        passed=ok,
                        actual=val,
                        expect=expect,
                        error_code=None if ok else "DB_AST_EXPECTATION_MISMATCH",
                    )
                )
        except Exception as exc:  # noqa: BLE001
            runs.append(
                AssertionRunItemOut(
                    assertion_id=rid,
                    assertion_type="rowset" if at == "rowset" else "scalar",
                    passed=False,
                    actual=None,
                    expect=expect,
                    error_code="DB_AST_RUNTIME_ERROR",
                    message=str(exc),
                )
            )

    return runs


def _scalar_expect(kind: str | None, actual: Any, expect: dict[str, Any]) -> bool:
    if kind in {"row_count_eq", "scalar_eq"}:
        return actual == expect.get("value")
    if kind == "row_count_zero":
        return int(actual or 0) == 0
    if kind == "scalar_gt":
        return actual > expect.get("value")
    if kind == "scalar_gte":
        return actual >= expect.get("value")
    if kind == "expression_true":
        return bool(actual)
    return False
