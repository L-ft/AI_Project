from __future__ import annotations

from typing import Any, Literal, Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.data_builder.schemas.mysql import MySQLConnectionIn


class OrchestrateStepIn(BaseModel):
    id: str = Field(..., min_length=1, max_length=64)
    kind: Literal["readonly", "write"]
    sql: str = Field(..., min_length=1, max_length=65535)
    """只读步骤最大行数（服务端会再受全局上限约束）。"""
    max_rows: int | None = Field(default=None, ge=1, le=5000)
    """若填写，则对来源步骤的每一行展开本写入 SQL，模板中用 {列名} 占位。"""
    foreach_source_step_id: str | None = Field(default=None, min_length=1, max_length=64)

    @field_validator("id", mode="before")
    @classmethod
    def _coerce_id(cls, v: Any) -> str:
        """LLM 常输出数字 id（如 1、2），统一为 str。"""
        if isinstance(v, bool):
            raise ValueError("步骤 id 不能为布尔值")
        if isinstance(v, int):
            return str(v)
        if isinstance(v, str):
            s = v.strip()
            if not s:
                raise ValueError("步骤 id 不能为空")
            return s
        return str(v)

    @field_validator("foreach_source_step_id", mode="before")
    @classmethod
    def _coerce_foreach_source_step_id(cls, v: Any) -> Any:
        if v is None:
            return None
        if isinstance(v, bool):
            raise ValueError("foreach_source_step_id 不能为布尔值")
        if isinstance(v, int):
            return str(v)
        if isinstance(v, str):
            s = v.strip()
            return s if s else None
        return str(v)

    @model_validator(mode="after")
    def _check_foreach(self) -> OrchestrateStepIn:
        if self.kind == "write" and self.foreach_source_step_id:
            if "{" not in self.sql or "}" not in self.sql:
                raise ValueError(f"步骤 {self.id}：启用 foreach 时 sql 须含 {{列名}} 占位符")
        if self.kind == "readonly" and self.foreach_source_step_id:
            raise ValueError("只读步骤不支持 foreach_source_step_id")
        return self


class OrchestrateExecuteIn(MySQLConnectionIn):
    confirm: bool = False
    steps: list[OrchestrateStepIn] = Field(..., min_length=1, max_length=32)


class OrchestrateStepResultOut(BaseModel):
    step_id: str
    kind: Literal["readonly", "write"]
    row_count: int = 0
    affected_rows: int = 0
    truncated: bool = False
    columns: list[str] = Field(default_factory=list)
    sample_rows: list[dict[str, Any]] = Field(default_factory=list)


class OrchestrateExecuteOut(BaseModel):
    ok: bool
    message: str
    results: list[OrchestrateStepResultOut] = Field(default_factory=list)


class WritePlanIn(BaseModel):
    instruction: str = Field(..., min_length=1, max_length=32000)
    tables_schema: list[dict[str, Any]] = Field(..., min_length=1, max_length=32)
    relation_hints: list[str] = Field(default_factory=list, max_length=32)
    provider: Literal["deepseek", "qwen", "openai_compatible"] = "deepseek"
    model: str = Field(..., min_length=1, max_length=128)
    api_key: str = Field(..., min_length=1, max_length=2048)
    base_url: str | None = Field(default=None, max_length=512)


class WritePlanOut(BaseModel):
    rationale: str = ""
    steps: list[OrchestrateStepIn]


class PlannerSelfQAItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    question: str = Field(..., min_length=1, max_length=512)
    answer: str = Field(..., min_length=1, max_length=4000)


class WritePlanPlannerOut(BaseModel):
    """CoT 第一段：规划器输出，供第二段生成 steps 与回归对比。"""

    model_config = ConfigDict(extra="ignore")

    rationale: str = Field(default="", max_length=8000)
    self_qa: list[PlannerSelfQAItem] = Field(default_factory=list, max_length=24)
    must_reference: list[str] = Field(
        default_factory=list,
        max_length=64,
        description="须引用的关联，如 child.fk_col -> parent.pk_col",
    )
    ordered_tables: list[str] = Field(default_factory=list, max_length=32)
    execution_strategy: Literal[
        "single_insert_select",
        "multi_step_select_then_insert",
        "foreach_template_from_prior_select",
        "mixed",
    ] = "mixed"
    bulk_insert_feasible: bool = True
    bulk_insert_notes: str = Field(default="", max_length=4000)
    risky_columns: list[str] = Field(default_factory=list, max_length=64)
    generator_directives: str = Field(
        default="",
        max_length=8000,
        description="给第二段的硬性指示（步骤形态、是否 foreach 等）",
    )

    @model_validator(mode="after")
    def _non_trivial(self) -> Self:
        if not self.rationale.strip() and not self.self_qa:
            raise ValueError("规划器输出无效：rationale 与 self_qa 不能同时为空")
        return self


class WritePlanStepsIn(BaseModel):
    """CoT 第二段：在规划器结论约束下生成可执行 steps。"""

    instruction: str = Field(..., min_length=1, max_length=32000)
    tables_schema: list[dict[str, Any]] = Field(..., min_length=1, max_length=32)
    relation_hints: list[str] = Field(default_factory=list, max_length=32)
    planner: dict[str, Any] = Field(..., description="第一段 /generate/write-plan/planner 的 JSON 对象")
    provider: Literal["deepseek", "qwen", "openai_compatible"] = "deepseek"
    model: str = Field(..., min_length=1, max_length=128)
    api_key: str = Field(..., min_length=1, max_length=2048)
    base_url: str | None = Field(default=None, max_length=512)

    @field_validator("planner")
    @classmethod
    def _planner_shape(cls, v: Any) -> Any:
        WritePlanPlannerOut.model_validate(v)
        return v


class WritePlanCotOut(BaseModel):
    planner: WritePlanPlannerOut
    write_plan: WritePlanOut
