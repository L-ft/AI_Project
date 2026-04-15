import pytest
from pydantic import ValidationError

from app.data_builder.schemas.orchestrate import WritePlanPlannerOut, WritePlanStepsIn


def test_planner_minimal_validate():
    p = WritePlanPlannerOut.model_validate(
        {
            "rationale": "x",
            "self_qa": [
                {"question": "q1", "answer": "a1"},
            ],
            "execution_strategy": "mixed",
        }
    )
    assert p.rationale == "x"
    assert len(p.self_qa) == 1


def test_planner_self_qa_requires_answer():
    with pytest.raises(ValidationError):
        WritePlanPlannerOut.model_validate(
            {
                "rationale": "x",
                "self_qa": [{"question": "q1"}],
            }
        )


def test_steps_in_rejects_invalid_planner():
    with pytest.raises(ValidationError):
        WritePlanStepsIn(
            instruction="ins",
            tables_schema=[{"database": "d", "table": "t", "columns": []}],
            planner={"not": "a planner"},
            model="m",
            api_key="k",
        )


def test_steps_in_accepts_valid_planner_dict():
    planner = WritePlanPlannerOut(
        rationale="r",
        self_qa=[{"question": "q", "answer": "a"}],
        execution_strategy="mixed",
    )
    b = WritePlanStepsIn(
        instruction="ins",
        tables_schema=[{"database": "d", "table": "t", "columns": []}],
        planner=planner.model_dump(mode="python"),
        model="m",
        api_key="k",
    )
    assert b.instruction == "ins"
