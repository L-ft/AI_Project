from __future__ import annotations

import re

import sqlparse

_BANNED = re.compile(
    r"(?is)\b("
    r"INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|"
    r"CALL|DO|HANDLER|REPLACE|"
    r"INTO\s+OUTFILE|INTO\s+DUMPFILE|LOAD\s+DATA"
    r")\b"
)

# 写入编排：仅允许 INSERT（含 INSERT … SELECT），仍禁止高危子串。
_BANNED_IN_INSERT = re.compile(
    r"(?is)\b("
    r"UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|GRANT|REVOKE|"
    r"CALL|DO|HANDLER|REPLACE|"
    r"INTO\s+OUTFILE|INTO\s+DUMPFILE|LOAD\s+DATA"
    r")\b"
)


def normalize_sql(sql: str) -> str:
    text = sqlparse.format(sql or "", strip_comments=True).strip()
    if text.endswith(";"):
        text = text[:-1].strip()
    return text


def _first_meaningful_keyword(stmt: str) -> str | None:
    parsed_list = sqlparse.parse(stmt)
    if not parsed_list:
        return None
    root = parsed_list[0]
    for tok in root.tokens:
        if tok.is_whitespace:
            continue
        if str(tok).strip() == "":
            continue
        val = str(tok).strip()
        if val == "(":
            continue
        if hasattr(tok, "value"):
            return str(tok.value).upper()
        return val.split()[0].upper()
    return None


def validate_ai_select_sql(sql: str) -> str:
    """单条只读查询：仅允许 SELECT / WITH …，并拦截常见写操作关键字。"""
    text = normalize_sql(sql)
    if not text:
        raise ValueError("SQL 不能为空")

    parts = [p.strip() for p in sqlparse.split(text) if p.strip()]
    if len(parts) != 1:
        raise ValueError("仅允许一条 SQL 语句")

    stmt = parts[0]
    kw = _first_meaningful_keyword(stmt)
    if kw not in {"SELECT", "WITH"}:
        raise ValueError("仅允许 SELECT 或 WITH（公用表表达式）查询")

    if _BANNED.search(stmt):
        raise ValueError("SQL 包含不允许的操作（写库/导出等）")

    return stmt


def validate_write_sql(sql: str) -> str:
    """单条写入语句：仅允许 INSERT（可含 INSERT … SELECT），禁止多语句与高危操作。"""
    text = normalize_sql(sql)
    if not text:
        raise ValueError("SQL 不能为空")

    parts = [p.strip() for p in sqlparse.split(text) if p.strip()]
    if len(parts) != 1:
        raise ValueError("仅允许一条 SQL 语句")

    stmt = parts[0]
    kw = _first_meaningful_keyword(stmt)
    if kw != "INSERT":
        raise ValueError("写入步骤仅允许 INSERT（含 INSERT … SELECT）")

    if _BANNED_IN_INSERT.search(stmt):
        raise ValueError("SQL 包含不允许的操作（DDL/删除/导出等）")

    return stmt


def append_limit_if_missing(sql: str, limit: int) -> str:
    """在语句末尾追加 LIMIT（若末尾尚无 LIMIT）。"""
    s = sql.rstrip()
    if re.search(r"(?is)\blimit\s+[0-9]+\s*$", s):
        return s
    return f"{s} LIMIT {int(limit)}"
