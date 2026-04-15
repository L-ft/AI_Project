from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from app.data_builder.schemas.mysql import MySQLConnectionIn


class RelationshipsIn(MySQLConnectionIn):
    tables: list[str] = Field(..., min_length=1, max_length=32)


class RelationshipEdgeOut(BaseModel):
    from_table: str
    from_column: str
    to_table: str
    to_column: str
    source: Literal["fk", "heuristic"]
    confidence: float = Field(..., ge=0.0, le=1.0)


class RelationshipsOut(BaseModel):
    edges: list[RelationshipEdgeOut]
