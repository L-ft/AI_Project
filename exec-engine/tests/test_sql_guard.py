import pytest

from app.data_builder.services.sql_guard import append_limit_if_missing, validate_ai_select_sql, validate_write_sql


def test_validate_select_ok():
    sql = validate_ai_select_sql("SELECT id FROM users WHERE a = 1")
    assert "SELECT" in sql.upper()


def test_validate_with_ok():
    sql = validate_ai_select_sql(
        "WITH t AS (SELECT 1 AS x) SELECT * FROM t"
    )
    assert sql.upper().startswith("WITH")


def test_reject_insert():
    with pytest.raises(ValueError, match="仅允许"):
        validate_ai_select_sql("INSERT INTO t VALUES (1)")


def test_reject_multi_statement():
    with pytest.raises(ValueError, match="一条"):
        validate_ai_select_sql("SELECT 1; SELECT 2")


def test_reject_multi_with_delete_second():
    with pytest.raises(ValueError, match="一条"):
        validate_ai_select_sql("SELECT * FROM t; DELETE FROM t")


def test_reject_union_injection_style():
    # 单条里含 DELETE 子串但合法？应被 _BANNED 拦截
    with pytest.raises(ValueError):
        validate_ai_select_sql("DELETE FROM users WHERE id = 1")


def test_append_limit():
    s = append_limit_if_missing("SELECT 1", 10)
    assert s.rstrip().upper().endswith("LIMIT 10")


def test_append_limit_skips_when_present():
    s = append_limit_if_missing("SELECT 1 LIMIT 5", 10)
    assert "LIMIT 5" in s.upper()


def test_validate_insert_ok():
    sql = validate_write_sql("INSERT INTO t (a) VALUES (1)")
    assert sql.upper().startswith("INSERT")


def test_validate_insert_select_ok():
    sql = validate_write_sql("INSERT INTO t (a) SELECT id FROM u WHERE x = 1")
    assert "INSERT" in sql.upper() and "SELECT" in sql.upper()


def test_reject_write_multi_statement():
    with pytest.raises(ValueError, match="一条"):
        validate_write_sql("INSERT INTO t VALUES (1); INSERT INTO t VALUES (2)")


def test_reject_update_disguised():
    with pytest.raises(ValueError, match="仅允许"):
        validate_write_sql("UPDATE t SET a = 1")
