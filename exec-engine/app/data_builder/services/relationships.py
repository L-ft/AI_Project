from __future__ import annotations

from collections import defaultdict

from app.data_builder.schemas.mysql import MySQLConnectionIn
from app.data_builder.schemas.relationships import RelationshipEdgeOut, RelationshipsIn, RelationshipsOut
from app.data_builder.services import mysql_meta


def _types_compatible(a: str, b: str) -> bool:
    al = (a or "").lower().split("(")[0].strip()
    bl = (b or "").lower().split("(")[0].strip()
    if al == bl:
        return True
    nums = {"tinyint", "smallint", "mediumint", "int", "integer", "bigint"}
    if al in nums and bl in nums:
        return True
    strs = {"char", "varchar", "tinytext", "text", "mediumtext", "longtext"}
    if al in strs and bl in strs:
        return True
    return False


def _table_name_matches_base(table: str, base: str) -> bool:
    tl = table.lower()
    bl = base.lower()
    if not bl:
        return False
    if tl == bl:
        return True
    if tl == bl + "s":
        return True
    if tl.rstrip("s") == bl:
        return True
    return False


def _candidate_parent_tables(col: str, tables: list[str]) -> list[str]:
    c = col.lower()
    if not c.endswith("_id"):
        return []
    base = c[:-3]
    if not base:
        return []
    return [t for t in tables if _table_name_matches_base(t, base)]


def _fetch_physical_fks(
    cfg: MySQLConnectionIn, database: str, tables: list[str]
) -> list[tuple[str, str, str, str]]:
    if not tables:
        return []
    conn = mysql_meta.mysql_connect(cfg)
    try:
        with conn.cursor() as cur:
            ph = ",".join(["%s"] * len(tables))
            cur.execute(
                f"""
                SELECT
                    k.TABLE_NAME AS from_table,
                    k.COLUMN_NAME AS from_column,
                    k.REFERENCED_TABLE_NAME AS to_table,
                    k.REFERENCED_COLUMN_NAME AS to_column
                FROM information_schema.KEY_COLUMN_USAGE k
                INNER JOIN information_schema.TABLE_CONSTRAINTS t
                    ON k.CONSTRAINT_SCHEMA = t.CONSTRAINT_SCHEMA
                    AND k.TABLE_NAME = t.TABLE_NAME
                    AND k.CONSTRAINT_NAME = t.CONSTRAINT_NAME
                WHERE k.TABLE_SCHEMA = %s
                  AND t.CONSTRAINT_TYPE = 'FOREIGN KEY'
                  AND k.TABLE_NAME IN ({ph})
                  AND k.REFERENCED_TABLE_NAME IS NOT NULL
                  AND k.REFERENCED_COLUMN_NAME IS NOT NULL
                """,
                (database, *tables),
            )
            rows = cur.fetchall() or []
        out: list[tuple[str, str, str, str]] = []
        for r in rows:
            out.append(
                (
                    str(r["from_table"]),
                    str(r["from_column"]),
                    str(r["to_table"]),
                    str(r["to_column"]),
                )
            )
        return out
    finally:
        conn.close()


def discover_relationships(body: RelationshipsIn) -> RelationshipsOut:
    database = mysql_meta.require_database_name(body.database)
    seen: set[str] = set()
    tables: list[str] = []
    for raw in body.tables:
        mysql_meta.assert_safe_ident(raw, "表名")
        if raw in seen:
            continue
        seen.add(raw)
        tables.append(raw)

    col_rows = mysql_meta.sync_tables_schema_batch(body, tables)
    cols_by_table: dict[str, list] = {t: [] for t in tables}
    for db, table, columns in col_rows:
        _ = db
        cols_by_table[table] = columns

    edges: list[RelationshipEdgeOut] = []
    edge_key: set[tuple[str, str, str, str]] = set()

    for ft, fc, tt, tc in _fetch_physical_fks(body, database, tables):
        if tt not in seen:
            continue
        k = (ft, fc, tt, tc)
        if k in edge_key:
            continue
        edge_key.add(k)
        edges.append(
            RelationshipEdgeOut(
                from_table=ft,
                from_column=fc,
                to_table=tt,
                to_column=tc,
                source="fk",
                confidence=1.0,
            )
        )

    # 启发式：*_id 列指向候选父表的主键列 id（若存在且类型兼容）
    for child in tables:
        for col in cols_by_table.get(child, []):
            cname = col.name
            parents = _candidate_parent_tables(cname, tables)
            for parent in parents:
                if parent == child:
                    continue
                ref_col = next((x for x in cols_by_table.get(parent, []) if x.name.lower() == "id"), None)
                if not ref_col:
                    continue
                if not _types_compatible(col.data_type, ref_col.data_type):
                    continue
                k = (child, cname, parent, ref_col.name)
                if k in edge_key:
                    continue
                edge_key.add(k)
                has_ai = any(
                    "auto_increment" in ((x.extra or "").lower()) for x in cols_by_table.get(parent, [])
                )
                edges.append(
                    RelationshipEdgeOut(
                        from_table=child,
                        from_column=cname,
                        to_table=parent,
                        to_column=ref_col.name,
                        source="heuristic",
                        confidence=0.75 if has_ai else 0.65,
                    )
                )

    edges.sort(key=lambda e: (-e.confidence, e.from_table, e.from_column, e.to_table))
    return RelationshipsOut(edges=edges)
