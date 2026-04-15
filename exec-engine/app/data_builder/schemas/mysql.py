from pydantic import BaseModel, Field


class MySQLConnectionIn(BaseModel):
    host: str = Field(..., min_length=1, max_length=253)
    port: int = Field(3306, ge=1, le=65535)
    user: str = Field(..., min_length=1, max_length=64)
    password: str = Field(default="", max_length=512)
    database: str = Field(default="", max_length=64)


class ConnectionTestOut(BaseModel):
    ok: bool
    message: str
    server_version: str | None = None


class TableListOut(BaseModel):
    tables: list[str]


class SchemaSyncIn(MySQLConnectionIn):
    table: str = Field(..., min_length=1, max_length=64)


class ColumnInfo(BaseModel):
    name: str
    data_type: str
    column_type: str
    nullable: bool
    default: str | None = None
    comment: str = ""
    extra: str = ""


class TableSchemaOut(BaseModel):
    database: str
    table: str
    columns: list[ColumnInfo]


class SchemaSyncBatchIn(MySQLConnectionIn):
    tables: list[str] = Field(..., min_length=1, max_length=32)


class SchemaSyncBatchOut(BaseModel):
    schemas: list[TableSchemaOut]
