from __future__ import annotations

from fastapi import APIRouter, Depends

from ..core.auth import require_auth
from ..dependencies import get_requirement_case_service
from ..services.requirement_cases import RequirementCaseService


router = APIRouter(
    prefix="/groups",
    tags=["Requirement Groups"],
    dependencies=[Depends(require_auth)],
)


@router.get("")
def list_groups(service: RequirementCaseService = Depends(get_requirement_case_service)):
    return {
        "code": 200,
        "data": service.list_groups(),
        "msg": "success",
    }


@router.delete("/{group_code}")
def delete_group(
    group_code: str,
    service: RequirementCaseService = Depends(get_requirement_case_service),
):
    service.delete_group(group_code)
    return {
        "code": 200,
        "data": {"id": group_code, "code": group_code},
        "msg": "deleted",
    }


@router.get("/{group_code}/cases")
def list_cases_for_group(
    group_code: str,
    service: RequirementCaseService = Depends(get_requirement_case_service),
):
    return {
        "code": 200,
        "data": service.list_group_cases(group_code),
        "msg": "success",
    }
