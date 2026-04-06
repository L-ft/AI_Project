from fastapi import APIRouter, Depends

from ..core.auth import require_auth
from ..dependencies import get_dashboard_service
from ..services.api_mgmt import DashboardService


router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(require_auth)],
)


@router.get("/overview")
def dashboard_overview(
    service: DashboardService = Depends(get_dashboard_service),
):
    return {"code": 200, "data": service.overview(), "msg": "success"}
