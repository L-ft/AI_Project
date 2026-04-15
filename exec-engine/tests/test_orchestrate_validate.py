import pytest

from app.data_builder.schemas.orchestrate import OrchestrateExecuteIn, OrchestrateStepIn
from app.data_builder.services.orchestrate_execute import validate_orchestration_plan


def _conn_body(**kwargs):
    base = dict(
        host="127.0.0.1",
        port=3306,
        user="u",
        password="",
        database="db",
        confirm=False,
    )
    base.update(kwargs)
    return base


def test_validate_ok_readonly_then_write():
    body = OrchestrateExecuteIn(
        **_conn_body(),
        steps=[
            OrchestrateStepIn(id="s1", kind="readonly", sql="SELECT id FROM t LIMIT 3", max_rows=10),
            OrchestrateStepIn(id="s2", kind="write", sql="INSERT INTO c (pid) VALUES (1)"),
        ],
    )
    validate_orchestration_plan(body)


def test_reject_foreach_order():
    body = OrchestrateExecuteIn(
        **_conn_body(),
        steps=[
            OrchestrateStepIn(
                id="s2",
                kind="write",
                sql="INSERT INTO c (pid) VALUES ({id})",
                foreach_source_step_id="s1",
            ),
            OrchestrateStepIn(id="s1", kind="readonly", sql="SELECT id FROM t LIMIT 3"),
        ],
    )
    with pytest.raises(ValueError, match="foreach"):
        validate_orchestration_plan(body)


def test_reject_duplicate_step_ids():
    body = OrchestrateExecuteIn(
        **_conn_body(),
        steps=[
            OrchestrateStepIn(id="s1", kind="readonly", sql="SELECT 1"),
            OrchestrateStepIn(id="s1", kind="readonly", sql="SELECT 2"),
        ],
    )
    with pytest.raises(ValueError, match="唯一"):
        validate_orchestration_plan(body)


def test_numeric_step_id_coerced_to_string():
    """与 LLM 输出一致：id 为整数时自动转为字符串。"""
    body = OrchestrateExecuteIn(
        **_conn_body(),
        steps=[
            OrchestrateStepIn(id=1, kind="readonly", sql="SELECT 1"),  # type: ignore[arg-type]
            OrchestrateStepIn(id=2, kind="write", sql="INSERT INTO t (a) VALUES (1)"),
        ],
    )
    validate_orchestration_plan(body)
    assert body.steps[0].id == "1"
    assert body.steps[1].id == "2"
