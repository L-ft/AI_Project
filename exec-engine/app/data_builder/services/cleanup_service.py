"""CleanupService：侧车驱动清理，默认 chunk=500；仅删除 row_map 中登记且 task_id 匹配的主键行。"""

from __future__ import annotations

import json
from typing import Any

from app.data_builder.services.binding_row_gen import resolve_task_marker
from app.data_builder.services.data_builder_sidecar import ensure_row_map_table
from app.data_builder.services.mysql_meta import assert_safe_ident
from app.data_builder.services.task_store import TaskRecord

# M1 合同：批量大小 500（侧车拉取批）
DEFAULT_ROW_MAP_CHUNK = 500


def _lit(conn: Any, s: str) -> str:
    esc = conn.escape(s)
    if isinstance(esc, (bytes, bytearray)):
        return esc.decode(conn.charset or "utf8", errors="replace")
    return str(esc)


def _coerce_json_list(raw: Any, *, label: str) -> list[Any]:
    if raw is None:
        return []
    if isinstance(raw, list):
        return raw
    if isinstance(raw, (bytes, bytearray)):
        raw = raw.decode("utf-8", errors="replace")
    if isinstance(raw, str):
        return json.loads(raw)
    raise TypeError(f"{label} 无法解析为 JSON 数组: {type(raw).__name__}")


class CleanupService:
    """
    安全边界：
    - 业务 DELETE 仅使用从 data_builder_row_map 读出的 (task_id, table_name, pk) 组合；
    - predicate 路径仅替换 :task_marker 为当前任务解析后的字面量（指纹匹配），避免误删存量。
    """

    def __init__(self, *, row_map_chunk: int = DEFAULT_ROW_MAP_CHUNK) -> None:
        self.row_map_chunk = row_map_chunk

    def _delete_chunk_for_table(self, cur, conn, task_id: str, table: str) -> int:
        assert_safe_ident(table, "表名")
        total = 0
        while True:
            cur.execute(
                """
                SELECT id, pk_columns, pk_values FROM data_builder_row_map
                WHERE task_id = %s AND table_name = %s
                LIMIT %s
                """,
                (task_id, table, self.row_map_chunk),
            )
            batch = cur.fetchall() or []
            if not batch:
                break

            parsed: list[tuple[list[str], list[Any]]] = []
            row_map_ids: list[int] = []
            for r in batch:
                row_map_ids.append(int(r["id"]))
                cols = _coerce_json_list(r.get("pk_columns"), label="pk_columns")
                vals = _coerce_json_list(r.get("pk_values"), label="pk_values")
                if not cols or len(cols) != len(vals):
                    continue
                parsed.append((cols, vals))

            if parsed:
                cols0 = parsed[0][0]
                if len(cols0) == 1 and all(len(p[0]) == 1 and p[0][0] == cols0[0] for p in parsed):
                    col = cols0[0]
                    assert_safe_ident(col, "主键列")
                    pvals = [p[1][0] for p in parsed]
                    placeholders = ",".join(["%s"] * len(pvals))
                    cur.execute(
                        f"DELETE FROM `{table}` WHERE `{col}` IN ({placeholders})",
                        pvals,
                    )
                    total += int(cur.rowcount or 0)
                else:
                    for cols, vals in parsed:
                        cond = " AND ".join(f"`{c}`=%s" for c in cols)
                        cur.execute(f"DELETE FROM `{table}` WHERE {cond}", vals)
                        total += int(cur.rowcount or 0)

            if row_map_ids:
                cur.execute(
                    f"DELETE FROM data_builder_row_map WHERE id IN ({','.join(str(i) for i in row_map_ids)})"
                )
        return total

    def run_cleanup(self, conn, rec: TaskRecord) -> tuple[dict[str, int], str]:
        manifest = rec.manifest
        task_id = rec.task_id
        db = manifest["database_context"]["database"].strip()
        assert_safe_ident(db, "库名")
        marker = resolve_task_marker(manifest, task_id)
        marker_lit = _lit(conn, marker)
        mode = manifest["cleanup"]["mode"]
        deleted: dict[str, int] = {}

        with conn.cursor() as cur:
            cur.execute(f"USE `{db}`")
            ensure_row_map_table(cur)

            if mode in {"row_map", "hybrid"}:
                cur.execute(
                    "SELECT DISTINCT table_name FROM data_builder_row_map WHERE task_id = %s",
                    (task_id,),
                )
                tables = [str(r["table_name"]) for r in (cur.fetchall() or [])]
                for t in sorted(tables):
                    n = self._delete_chunk_for_table(cur, conn, task_id, t)
                    deleted[t] = deleted.get(t, 0) + n

            if mode in {"predicate", "hybrid"}:
                plans = sorted(manifest["cleanup"]["plans"], key=lambda p: int(p["order"]))
                for plan in plans:
                    pred = plan.get("predicate_sql")
                    if not pred:
                        continue
                    table = str(plan["table"])
                    assert_safe_ident(table, "表名")
                    body = pred.replace(":task_marker", marker_lit)
                    sql = f"DELETE FROM `{table}` WHERE {body}"
                    cur.execute(sql)
                    deleted[table] = deleted.get(table, 0) + int(cur.rowcount or 0)

            cur.execute("DELETE FROM data_builder_row_map WHERE task_id = %s", (task_id,))

        return deleted, mode


def run_cleanup(conn, rec: TaskRecord) -> tuple[dict[str, int], str]:
    """兼容旧 import：默认 chunk=500。"""
    return CleanupService().run_cleanup(conn, rec)
