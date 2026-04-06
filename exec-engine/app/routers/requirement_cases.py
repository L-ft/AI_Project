from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile
from fastapi.responses import JSONResponse

from ..core.auth import require_auth
from ..dependencies import get_requirement_case_service
from ..services.requirement_cases import RequirementCaseService, RequirementJobConflict


router = APIRouter(
    prefix="/requirement-cases",
    tags=["Requirement Cases"],
    dependencies=[Depends(require_auth)],
)


@router.post("/jobs")
async def create_job(
    file: UploadFile = File(...),
    duplicate_action: Optional[str] = Form(None),
    overwrite_group_id: Optional[str] = Form(None),
    service: RequirementCaseService = Depends(get_requirement_case_service),
):
    try:
        data = await service.create_job(
            file=file,
            duplicate_action=duplicate_action,
            overwrite_group_id=overwrite_group_id,
        )
    except RequirementJobConflict as exc:
        return JSONResponse(
            status_code=409,
            content={
                "code": 409,
                "msg": "Requirement document already exists",
                "data": exc.payload,
            },
        )

    return {
        "code": 200,
        "data": data,
        "msg": "Job created",
    }


@router.get("/jobs/{task_id}")
def get_job(
    task_id: str,
    service: RequirementCaseService = Depends(get_requirement_case_service),
):
    return {
        "code": 200,
        "data": service.get_job(task_id),
        "msg": "success",
    }
