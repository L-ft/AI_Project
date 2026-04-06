from __future__ import annotations

from fastapi import APIRouter, Depends, Request

from ..core.auth import require_auth
from ..dependencies import get_debug_service
from ..services.debug import DebugService


router = APIRouter(tags=["Debug"])


@router.post("/proxy", dependencies=[Depends(require_auth)])
async def debug_proxy(
    request: Request,
    service: DebugService = Depends(get_debug_service),
):
    payload = await request.json()
    return await service.proxy_request(payload)


@router.api_route("/mock/{interface_path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def dynamic_mock_handler(
    request: Request,
    interface_path: str,
    service: DebugService = Depends(get_debug_service),
):
    return service.mock_response(interface_path, dict(request.query_params))
