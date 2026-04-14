from typing import Any, Literal

from pydantic import BaseModel, Field

from app.data_builder.schemas.mysql import MySQLConnectionIn


class Nl2SqlIn(BaseModel):
    instruction: str = Field(..., min_length=1, max_length=32000)
    table_schema: dict[str, Any]
    provider: Literal["deepseek", "qwen", "openai_compatible"] = "deepseek"
    model: str = Field(..., min_length=1, max_length=128)
    api_key: str = Field(..., min_length=1, max_length=2048)
    base_url: str | None = Field(default=None, max_length=512)


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
