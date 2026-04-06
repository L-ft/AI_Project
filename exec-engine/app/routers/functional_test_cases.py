from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, File, Query, UploadFile

from ..core.auth import require_auth
from ..dependencies import get_functional_test_case_service
from ..schemas.api_mgmt import (
    FunctionalTestCaseCreate,
    FunctionalTestCaseListPayload,
    FunctionalTestCaseListResponse,
    FunctionalTestCaseResponse,
    FunctionalTestCaseUpdate,
    ResponseModel,
)
from ..services.functional_cases import FunctionalTestCaseService


router = APIRouter(
    prefix="/functional-test-cases",
    tags=["Functional Test Cases"],
    dependencies=[Depends(require_auth)],
)


@router.get("", response_model=FunctionalTestCaseListResponse)
def list_functional_cases(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=200),
    module: Optional[str] = None,
    keyword: Optional[str] = None,
    service: FunctionalTestCaseService = Depends(get_functional_test_case_service),
):
    items, total = service.list_cases(page=page, page_size=page_size, module=module, keyword=keyword)
    return FunctionalTestCaseListResponse(
        data=FunctionalTestCaseListPayload(items=items, total=total)
    )


@router.post("", response_model=FunctionalTestCaseResponse)
def create_functional_case(
    body: FunctionalTestCaseCreate,
    service: FunctionalTestCaseService = Depends(get_functional_test_case_service),
):
    return FunctionalTestCaseResponse(data=service.create_case(body))


@router.get("/{case_code}", response_model=FunctionalTestCaseResponse)
def get_functional_case(
    case_code: str,
    service: FunctionalTestCaseService = Depends(get_functional_test_case_service),
):
    return FunctionalTestCaseResponse(data=service.get_case(case_code))


@router.patch("/{case_code}", response_model=FunctionalTestCaseResponse)
def update_functional_case(
    case_code: str,
    body: FunctionalTestCaseUpdate,
    service: FunctionalTestCaseService = Depends(get_functional_test_case_service),
):
    return FunctionalTestCaseResponse(data=service.update_case(case_code, body))


@router.delete("/{case_code}", response_model=ResponseModel)
def delete_functional_case(
    case_code: str,
    service: FunctionalTestCaseService = Depends(get_functional_test_case_service),
):
    service.delete_case(case_code)
    return ResponseModel(msg="deleted")


@router.post("/import/excel", response_model=ResponseModel)
async def import_excel(
    file: UploadFile = File(...),
    service: FunctionalTestCaseService = Depends(get_functional_test_case_service),
):
    return ResponseModel(data=await service.import_excel(file))


@router.post("/import/xmind", response_model=ResponseModel)
async def import_xmind(
    file: UploadFile = File(...),
    service: FunctionalTestCaseService = Depends(get_functional_test_case_service),
):
    return ResponseModel(data=await service.import_xmind(file))
