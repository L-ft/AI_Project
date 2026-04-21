import json

import pytest

from app.data_builder.schemas.mysql import MySQLConnectionIn
from app.data_builder.schemas.tasks import AssertionRunItemOut
from app.data_builder.services import cleanup_service
from app.data_builder.services import task_batch_execute as svc


class _FakeCursor:
    def __init__(self, conn):
        self.conn = conn
        self.rowcount = 1
        self.lastrowid = 101

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, sql, params=None):
        self.conn.executed.append((sql, params))


class _FakeConn:
    charset = "utf8"

    def __init__(self):
        self.executed = []
        self.closed = False

    def autocommit(self, value):
        self.autocommit_value = value

    def cursor(self):
        return _FakeCursor(self)

    def close(self):
        self.closed = True

    def escape(self, value):
        return f"'{value}'"


def _manifest(batch_count=1):
    return {
        "database_context": {"database": "db"},
        "generation": {
            "sql_template": "INSERT INTO `target_table` (`name`) VALUES (:name)",
            "bindings": [],
            "batching": {
                "batch_count": batch_count,
                "batches": [
                    {"batch_index": i, "row_count": 1}
                    for i in range(batch_count)
                ],
            },
        },
        "assertions": [
            {"id": "a1", "severity": "error"},
        ],
        "meta": {"data_builder": {"insert_pk_column": "id"}},
    }


def _mysql():
    return MySQLConnectionIn(host="127.0.0.1", port=3306, user="u", password="", database="db")


def test_execute_batch_payload_returns_assertion_runs(monkeypatch):
    fake_conn = _FakeConn()
    monkeypatch.setattr(svc.mysql_meta, "mysql_connect", lambda *args, **kwargs: fake_conn)
    monkeypatch.setattr(svc, "ensure_row_map_table", lambda cur: None)
    monkeypatch.setattr(svc, "build_placeholder_values", lambda *args, **kwargs: {"name": "x"})
    monkeypatch.setattr(
        svc,
        "expand_named_sql",
        lambda conn, template, values: "INSERT INTO `target_table` (`name`) VALUES ('x')",
    )
    monkeypatch.setattr(
        svc,
        "run_assertions",
        lambda *args, **kwargs: [AssertionRunItemOut(assertion_id="a1", passed=False)],
    )

    out = svc.execute_batch_payload(
        "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        _manifest(batch_count=1),
        _mysql(),
        0,
    )

    assert out.status == "FAILED_ASSERTION"
    assert out.assertions_evaluated is True
    assert out.assertion_summary is not None
    assert out.assertion_summary.failed_rules == ["a1"]
    assert [r.assertion_id for r in out.assertion_runs] == ["a1"]
    assert any(
        "INSERT INTO data_builder_row_map" in sql
        for sql, _params in fake_conn.executed
    )
    assert fake_conn.closed is True


def test_execute_batch_payload_rejects_out_of_range():
    with pytest.raises(svc.BatchIndexOutOfRange):
        svc.execute_batch_payload(
            "7c9e6679-7425-40de-944b-e07fc1f90ae7",
            _manifest(batch_count=1),
            _mysql(),
            1,
        )


class _CleanupCursor:
    def __init__(self, conn):
        self.conn = conn
        self.rowcount = 0
        self._rows = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, sql, params=None):
        self.conn.executed.append((sql, params))
        normalized = " ".join(sql.split())
        if normalized.startswith("SELECT DISTINCT table_name FROM data_builder_row_map"):
            self._rows = [{"table_name": "target_table"}]
        elif normalized.startswith("SELECT id, pk_columns, pk_values FROM data_builder_row_map"):
            if not self.conn.row_map_rows_returned:
                self._rows = [
                    {
                        "id": 11,
                        "pk_columns": json.dumps(["id"]),
                        "pk_values": json.dumps([101]),
                    }
                ]
                self.conn.row_map_rows_returned = True
            else:
                self._rows = []
        else:
            self._rows = []

        if normalized.startswith("DELETE FROM `target_table`"):
            self.rowcount = 1
        elif normalized.startswith("DELETE FROM `predicate_table`"):
            self.rowcount = 2
        elif normalized.startswith("DELETE FROM data_builder_row_map"):
            self.rowcount = 1
        else:
            self.rowcount = 0

    def fetchall(self):
        return self._rows


class _CleanupConn:
    charset = "utf8"

    def __init__(self):
        self.executed = []
        self.row_map_rows_returned = False

    def cursor(self):
        return _CleanupCursor(self)

    def escape(self, value):
        return f"'{value}'"


def test_run_cleanup_payload_uses_row_map_and_predicate(monkeypatch):
    monkeypatch.setattr(cleanup_service, "ensure_row_map_table", lambda cur: None)
    conn = _CleanupConn()
    manifest = {
        "database_context": {"database": "db"},
        "cleanup": {
            "mode": "hybrid",
            "plans": [
                {
                    "table": "predicate_table",
                    "order": 20,
                    "predicate_sql": "remark = :task_marker",
                }
            ],
        },
        "fingerprint": {
            "marker": {
                "prefix": "DB_TASK_",
                "value_template": "${prefix}${task_id}",
            }
        },
    }

    deleted, mode = cleanup_service.run_cleanup_payload(
        conn,
        task_id="7c9e6679-7425-40de-944b-e07fc1f90ae7",
        manifest=manifest,
    )

    assert mode == "hybrid"
    assert deleted == {"target_table": 1, "predicate_table": 2}
    assert any(
        sql.startswith("DELETE FROM `target_table` WHERE `id` IN")
        for sql, _params in conn.executed
    )
    assert any(
        "DELETE FROM data_builder_row_map WHERE task_id = %s" in sql
        for sql, _params in conn.executed
    )
    assert any(
        "DELETE FROM `predicate_table` WHERE remark = 'DB_TASK_7c9e6679-7425-40de-944b-e07fc1f90ae7'" in sql
        for sql, _params in conn.executed
    )
