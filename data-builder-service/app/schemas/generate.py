from typing import Any, Literal

from pydantic import BaseModel, Field


class GeneratePreviewIn(BaseModel):
    instruction: str = Field(..., min_length=1, max_length=32000)
    target_table: str = Field(..., min_length=1, max_length=64)
    table_schema: dict[str, Any]
    generation_mode: Literal["template", "semantic"] = "template"


class BindingItem(BaseModel):
    placeholder: str
    column: str
    strategy: str
    params: dict[str, Any] = Field(default_factory=dict)


class GeneratePreviewOut(BaseModel):
    rationale: str
    sql_template: str
    bindings: list[BindingItem]
    generation_mode: Literal["template", "semantic"]
    estimated_total_rows: int = Field(ge=1)
    stub: bool = True


class ExecuteIn(BaseModel):
    plan: dict[str, Any]
    confirm: bool = False


class ExecuteOut(BaseModel):
    accepted: bool
    message: str
    task_id: str | None = None
