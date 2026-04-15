from typing import Any, Literal, Self

from pydantic import BaseModel, Field, model_validator

from app.data_builder.schemas.mysql import MySQLConnectionIn


class Nl2SqlIn(BaseModel):
    instruction: str = Field(..., min_length=1, max_length=32000)
    """单表结构（兼容旧客户端）；与 tables_schema 二选一，优先 tables_schema。"""
    table_schema: dict[str, Any] | None = Field(default=None)
    """多表结构，每项含 database、table、columns。"""
    tables_schema: list[dict[str, Any]] | None = Field(default=None, max_length=32)
    provider: Literal["deepseek", "qwen", "openai_compatible"] = "deepseek"
    model: str = Field(..., min_length=1, max_length=128)
    api_key: str = Field(..., min_length=1, max_length=2048)
    base_url: str | None = Field(default=None, max_length=512)

    @model_validator(mode="after")
    def _coalesce_schema(self) -> Self:
        ts = self.tables_schema
        if ts is not None and len(ts) > 0:
            return self
        if self.table_schema is not None:
            object.__setattr__(self, "tables_schema", [self.table_schema])
            return self
        raise ValueError("请提供 table_schema 或 tables_schema")


class Nl2SqlOut(BaseModel):
    sql: str
    rationale: str = ""


class QueryExecuteIn(MySQLConnectionIn):
    sql: str = Field(..., min_length=1, max_length=65535)
    max_rows: int = Field(default=500, ge=1, le=5000)
    timeout_seconds: int = Field(default=30, ge=1, le=120)


class QueryExecuteOut(BaseModel):
    columns: list[str]
    rows: list[dict[str, Any]]
    truncated: bool
    row_count: int
