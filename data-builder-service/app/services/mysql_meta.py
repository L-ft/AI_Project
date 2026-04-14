from __future__ import annotations

import re

import pymysql
from pymysql.cursors import DictCursor

from app.schemas.mysql import ColumnInfo, MySQLConnectionIn


_IDENT_RE = re.compile(r"^[a-zA-Z0-9_]+$")


def assert_safe_ident(name: str, label: str) -> None:
    if not _IDENT_RE.match(name):
        raise ValueError(f"{label} 仅允许字母、数字与下划线")


def mysql_connect(cfg: MySQLConnectionIn, *, connect_timeout: int = 10) -> pymysql.connections.Connection:
    assert_safe_ident(cfg.database, "库名")
    return pymysql.connect(
        host=cfg.host,
        port=cfg.port,
        user=cfg.user,
        password=cfg.password,
        database=cfg.database,
        connect_timeout=connect_timeout,
        charset="utf8mb4",
        cursorclass=DictCursor,
    )


def test_mysql(cfg: MySQLConnectionIn) -> tuple[bool, str, str | None]:
    try:
        conn = mysql_connect(cfg)
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT VERSION() AS v")
                row = cur.fetchone() or {}
                ver = row.get("v")
            return True, "连接成功", str(ver) if ver else None
        finally:
            conn.close()
    except Exception as exc:
        return False, str(exc), None


def list_base_tables(cfg: MySQLConnectionIn) -> list[str]:
    assert_safe_ident(cfg.database, "库名")
    conn = mysql_connect(cfg)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT TABLE_NAME AS t
                FROM information_schema.TABLES
                WHERE TABLE_SCHEMA = %s AND TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_NAME
                """,
                (cfg.database,),
            )
            rows = cur.fetchall() or []
        return [str(r["t"]) for r in rows if r.get("t")]
    finally:
        conn.close()


def sync_table_schema(cfg: MySQLConnectionIn, table: str) -> tuple[str, str, list[ColumnInfo]]:
    assert_safe_ident(cfg.database, "库名")
    assert_safe_ident(table, "表名")
    conn = mysql_connect(cfg)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT,
                       COLUMN_COMMENT, EXTRA, ORDINAL_POSITION
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
                ORDER BY ORDINAL_POSITION
                """,
                (cfg.database, table),
            )
            rows = cur.fetchall() or []
    finally:
        conn.close()

    columns: list[ColumnInfo] = []
    for r in rows:
        columns.append(
            ColumnInfo(
                name=str(r["COLUMN_NAME"]),
                data_type=str(r["DATA_TYPE"]),
                column_type=str(r["COLUMN_TYPE"]),
                nullable=str(r["IS_NULLABLE"]).upper() == "YES",
                default=None if r["COLUMN_DEFAULT"] is None else str(r["COLUMN_DEFAULT"]),
                comment=str(r["COLUMN_COMMENT"] or ""),
                extra=str(r["EXTRA"] or ""),
            )
        )
    return cfg.database, table, columns
