from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from ..core.auth import require_auth
from ..services.api_import import parse_import


router = APIRouter(
    prefix="/api-import",
    tags=["API Import"],
    dependencies=[Depends(require_auth)],
)


class ImportPreviewRequest(BaseModel):
    format: str = Field(..., description="openapi | postman | har | curl")
    content: str = Field(..., description="文件文本或粘贴内容")


@router.post("/preview")
def import_preview(body: ImportPreviewRequest):
    """
    阶段 1：解析 OpenAPI/Swagger、Postman Collection、HAR、cURL，返回可填入单接口调试表单的条目列表。
    """
    try:
        return parse_import(body.format, body.content)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
