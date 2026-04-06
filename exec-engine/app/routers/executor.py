from typing import Optional

from fastapi import APIRouter, Depends

from ..core.auth import require_auth
from ..dependencies import get_executor_service
from ..services.api_mgmt import ExecutorService


router = APIRouter(
    prefix="/executor",
    tags=["Executor"],
    dependencies=[Depends(require_auth)],
)


@router.post("/run-interface/{interface_code}")
async def run_interface(
    interface_code: str,
    env_id: Optional[str] = None,
    service: ExecutorService = Depends(get_executor_service),
):
    return await service.run_interface(interface_code, env_id)


@router.post("/run-test-case/{case_code}")
async def run_test_case(
    case_code: str,
    env_id: Optional[str] = None,
    service: ExecutorService = Depends(get_executor_service),
):
    return await service.run_test_case(case_code, env_id)
