from __future__ import annotations

import os
import re
from collections import defaultdict

import pymysql
from pymysql.cursors import DictCursor

from app.data_builder.schemas.mysql import ColumnInfo, MySQLConnectionIn


_IDENT_RE = re.compile(r"^[a-zA-Z0-9_]+$")
_LOCALHOST_NAMES = {"localhost", "127.0.0.1", "::1"}


def assert_safe_ident(name: str, label: str) -> None:
    if not _IDENT_RE.match(name):
        raise ValueError(f"{label} 仅允许字母、数字与下划线")


def is_running_in_docker() -> bool:
    return os.path.exists("/.dockerenv")


def resolve_connect_host(host: str) -> str:
    raw = host.strip()
    if raw.lower() not in _LOCALHOST_NAMES:
        return raw
    if not is_running_in_docker():
        return raw
    # Match desktop MySQL clients more closely: when the API runs inside
    # Docker, localhost should target the host machine, not the container.
    return (os.getenv("HOST_GATEWAY_NAME", "host.docker.internal") or "host.docker.internal").strip()


def require_database_name(database: str) -> str:
    db = database.strip()
    if not db:
        raise ValueError("请先填写数据库名")
    assert_safe_ident(db, "库名")
    return db


def normalize_mysql_error(exc: Exception) -> str:
    msg = str(exc)
    if "cryptography" in msg and ("sha256_password" in msg or "caching_sha2_password" in msg):
        return (
            "目标 MySQL 使用了 sha256_password / caching_sha2_password 认证方式，"
            "当前服务缺少 cryptography 依赖，无法完成握手。"
        )
    return msg


def mysql_connect(
    cfg: MySQLConnectionIn,
    *,
    connect_timeout: int = 10,
    read_timeout: int | None = None,
    write_timeout: int | None = None,
) -> pymysql.connections.Connection:
    kw: dict = dict(
        host=resolve_connect_host(cfg.host),
        port=cfg.port,
        user=cfg.user,
        password=cfg.password,
        database=cfg.database.strip() or None,
        connect_timeout=connect_timeout,
        charset="utf8mb4",
        cursorclass=DictCursor,
    )
    if read_timeout is not None:
        kw["read_timeout"] = read_timeout
    if write_timeout is not None:
        kw["write_timeout"] = write_timeout
    return pymysql.connect(**kw)


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
        return False, normalize_mysql_error(exc), None


def list_base_tables(cfg: MySQLConnectionIn) -> list[str]:
    database = require_database_name(cfg.database)
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
                (database,),
            )
            rows = cur.fetchall() or []
        return [str(r["t"]) for r in rows if r.get("t")]
    finally:
        conn.close()


def sync_table_schema(cfg: MySQLConnectionIn, table: str) -> tuple[str, str, list[ColumnInfo]]:
    database = require_database_name(cfg.database)
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
                (database, table),
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
    return database, table, columns


def sync_tables_schema_batch(cfg: MySQLConnectionIn, tables: list[str]) -> list[tuple[str, str, list[ColumnInfo]]]:
    """单次连接从 information_schema 拉取多张表的列定义，顺序与去重后的 tables 一致。"""
    database = require_database_name(cfg.database)
    if len(tables) > 32:
        raise ValueError("单次最多同步 32 张表")
    seen: set[str] = set()
    normalized: list[str] = []
    for raw in tables:
        assert_safe_ident(raw, "表名")
        if raw in seen:
            continue
        seen.add(raw)
        normalized.append(raw)
    if not normalized:
        raise ValueError("至少选择一张表")

    conn = mysql_connect(cfg)
    try:
        with conn.cursor() as cur:
            placeholders = ",".join(["%s"] * len(normalized))
            cur.execute(
                f"""
                SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT,
                       COLUMN_COMMENT, EXTRA, ORDINAL_POSITION
                FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA = %s AND TABLE_NAME IN ({placeholders})
                ORDER BY TABLE_NAME, ORDINAL_POSITION
                """,
                (database, *normalized),
            )
            rows = cur.fetchall() or []
    finally:
        conn.close()

    by_table: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        by_table[str(r["TABLE_NAME"])].append(r)

    result: list[tuple[str, str, list[ColumnInfo]]] = []
    for table in normalized:
        t_rows = by_table.get(table)
        if not t_rows:
            raise ValueError(f"表不存在或无权访问：{table}")
        columns: list[ColumnInfo] = []
        for r in t_rows:
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
        result.append((database, table, columns))
    return result
