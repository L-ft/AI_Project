from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import AliasChoices, BaseModel, Field

from ..core.auth import require_auth
from ..dependencies import get_test_case_service
from ..schemas.api_mgmt import (
    ResponseModel,
    TestCaseCreate,
    TestCaseListResponse,
    TestCaseResponse,
    TestCaseUpdate,
)
from ..services.api_mgmt import TestCaseService


router = APIRouter(
    prefix="/test-cases",
    tags=["Test Cases"],
    dependencies=[Depends(require_auth)],
)


class AiGenerateRequest(BaseModel):
    interface_id: str = Field(
        validation_alias=AliasChoices("interface_id", "interfaceId", "interfaceCode")
    )
    save: bool = False
    scenarios: list[str] = []
    extra_requirement: str = ""


@router.post("/ai-generate")
async def ai_generate_cases(
    req: AiGenerateRequest,
    service: TestCaseService = Depends(get_test_case_service),
):
    return await service.ai_generate_cases(req)


@router.post("", response_model=TestCaseResponse)
def create_test_case(
    test_case: TestCaseCreate,
    service: TestCaseService = Depends(get_test_case_service),
):
    return TestCaseResponse(data=service.create_test_case(test_case))


@router.get("", response_model=TestCaseListResponse)
def list_test_cases(
    interface_id: Optional[str] = None,
    interface_code: Optional[str] = Query(None, alias="interfaceCode"),
    case_type: Optional[str] = None,
    exclude_case_type: Optional[str] = None,
    requirement_group_id: Optional[str] = None,
    requirement_group_code: Optional[str] = Query(None, alias="requirementGroupCode"),
    service: TestCaseService = Depends(get_test_case_service),
):
    return TestCaseListResponse(
        data=service.list_test_cases(
            interface_id=interface_code or interface_id,
            case_type=case_type,
            exclude_case_type=exclude_case_type,
            requirement_group_id=requirement_group_code or requirement_group_id,
        )
    )


@router.get("/requirement-generated", response_model=ResponseModel)
def list_requirement_generated_cases(
    keyword: Optional[str] = None,
    doc_keyword: Optional[str] = Query(None, alias="docKeyword"),
    service: TestCaseService = Depends(get_test_case_service),
):
    return ResponseModel(data=service.list_requirement_generated_cases(keyword, doc_keyword))


@router.get("/{case_code}", response_model=TestCaseResponse)
def get_test_case(
    case_code: str,
    service: TestCaseService = Depends(get_test_case_service),
):
    return TestCaseResponse(data=service.get_test_case(case_code))


@router.patch("/{case_code}", response_model=TestCaseResponse)
def update_test_case(
    case_code: str,
    test_case: TestCaseUpdate,
    service: TestCaseService = Depends(get_test_case_service),
):
    return TestCaseResponse(data=service.update_test_case(case_code, test_case))


@router.delete("/{case_code}", response_model=ResponseModel)
def delete_test_case(
    case_code: str,
    service: TestCaseService = Depends(get_test_case_service),
):
    service.delete_test_case(case_code)
    return ResponseModel(msg="Test case deleted")
