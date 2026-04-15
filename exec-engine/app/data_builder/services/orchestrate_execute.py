from __future__ import annotations

import re
from typing import Any

from app.data_builder.schemas.orchestrate import (
    OrchestrateExecuteIn,
    OrchestrateExecuteOut,
    OrchestrateStepIn,
    OrchestrateStepResultOut,
)
from app.data_builder.services import mysql_meta
from app.data_builder.services.sql_guard import append_limit_if_missing, validate_ai_select_sql, validate_write_sql
from app.data_builder.state import settings_store


_PLACEHOLDER_RE = re.compile(r"\{(\w+)\}")


def _sql_literal(conn: Any, value: Any) -> str:
    if value is None:
        return "NULL"
    esc = conn.escape(value)
    if isinstance(esc, (bytes, bytearray)):
        return esc.decode(conn.charset or "utf8", errors="replace")
    return str(esc)


def _expand_write_template(conn: Any, template: str, row: dict[str, Any]) -> str:
    def repl(m: re.Match[str]) -> str:
        col = m.group(1)
        if col not in row:
            raise ValueError(f"展开写入 SQL 失败：来源行缺少列 `{col}`")
        return _sql_literal(conn, row[col])

    return _PLACEHOLDER_RE.sub(repl, template)


def _normalize_rows(raw_rows: list[dict[str, Any]], desc: Any) -> tuple[list[str], list[dict[str, Any]]]:
    rows_out = raw_rows or []
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
    return columns, normalized


def validate_orchestration_plan(body: OrchestrateExecuteIn) -> None:
    ids = [s.id for s in body.steps]
    if len(ids) != len(set(ids)):
        raise ValueError("步骤 id 必须唯一")

    id_set = set(ids)
    for step in body.steps:
        if step.kind == "readonly":
            capped = step.max_rows if step.max_rows is not None else 500
            stmt = validate_ai_select_sql(step.sql)
            append_limit_if_missing(stmt, min(5000, capped))
        elif step.kind == "write":
            if step.foreach_source_step_id:
                src = step.foreach_source_step_id
                if src not in id_set:
                    raise ValueError(f"步骤 {step.id} 的 foreach 来源 `{src}` 不存在")
                src_idx = next((i for i, x in enumerate(body.steps) if x.id == src), -1)
                cur_idx = body.steps.index(step)
                if src_idx < 0 or src_idx >= cur_idx:
                    raise ValueError(f"步骤 {step.id}：foreach 来源须为前置步骤")
                ph = _PLACEHOLDER_RE.findall(step.sql)
                if not ph:
                    raise ValueError(f"步骤 {step.id}：foreach 写入须包含 {{列名}} 占位符")
            else:
                validate_write_sql(step.sql)


def execute_orchestration(body: OrchestrateExecuteIn) -> OrchestrateExecuteOut:
    validate_orchestration_plan(body)

    if not body.confirm:
        return OrchestrateExecuteOut(
            ok=True,
            message="校验通过（未执行）。确认写入请传 confirm=true。",
            results=[],
        )

    database = mysql_meta.require_database_name(body.database)
    eff = settings_store.get_effective_settings()
    foreach_cap = min(10_000, int(eff.get("max_insert_select_rows", 1_000_000)))

    timeout = 120
    conn = mysql_meta.mysql_connect(
        body,
        connect_timeout=min(10, timeout),
        read_timeout=timeout,
        write_timeout=timeout,
    )
    results: list[OrchestrateStepResultOut] = []
    context_rows: dict[str, list[dict[str, Any]]] = {}

    try:
        conn.autocommit(False)
        with conn.cursor() as cur:
            cur.execute(f"USE `{database}`")

            for step in body.steps:
                if step.kind == "readonly":
                    max_rows = step.max_rows if step.max_rows is not None else 500
                    max_rows = min(5000, max_rows)
                    stmt = validate_ai_select_sql(step.sql)
                    capped = append_limit_if_missing(stmt, max_rows + 1)
                    cur.execute(capped)
                    desc = cur.description
                    raw_rows = cur.fetchmany(max_rows + 1) or []
                    truncated = len(raw_rows) > max_rows
                    raw_rows = raw_rows[:max_rows]
                    columns, normalized = _normalize_rows(raw_rows, desc)
                    context_rows[step.id] = normalized
                    sample = normalized[:5]
                    results.append(
                        OrchestrateStepResultOut(
                            step_id=step.id,
                            kind="readonly",
                            row_count=len(normalized),
                            affected_rows=0,
                            truncated=truncated,
                            columns=columns,
                            sample_rows=sample,
                        )
                    )
                else:
                    fe = step.foreach_source_step_id
                    if fe:
                        src_rows = context_rows.get(fe) or []
                        if len(src_rows) > foreach_cap:
                            raise ValueError(
                                f"步骤 {step.id}：foreach 来源行数 {len(src_rows)} 超过上限 {foreach_cap}，请先缩小只读步骤结果"
                            )
                        total_affected = 0
                        for row in src_rows:
                            expanded = _expand_write_template(conn, step.sql, row)
                            stmt = validate_write_sql(expanded)
                            cur.execute(stmt)
                            total_affected += int(cur.rowcount or 0)
                        results.append(
                            OrchestrateStepResultOut(
                                step_id=step.id,
                                kind="write",
                                row_count=0,
                                affected_rows=total_affected,
                                truncated=False,
                                columns=[],
                                sample_rows=[],
                            )
                        )
                    else:
                        stmt = validate_write_sql(step.sql)
                        cur.execute(stmt)
                        results.append(
                            OrchestrateStepResultOut(
                                step_id=step.id,
                                kind="write",
                                row_count=0,
                                affected_rows=int(cur.rowcount or 0),
                                truncated=False,
                                columns=[],
                                sample_rows=[],
                            )
                        )

        conn.commit()
        return OrchestrateExecuteOut(ok=True, message="编排执行成功（已提交）", results=results)
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
