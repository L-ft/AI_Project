from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Any, Dict, List, Optional
from ..database import get_db
from ..models.api_mgmt import TestCase, Interface, RequirementGroup
from ..schemas.api_mgmt import TestCaseCreate, TestCaseUpdate, TestCaseResponse, TestCaseListResponse, ResponseModel
from ..ai.llm_service import generate_test_cases
from pydantic import BaseModel

router = APIRouter(prefix="/test-cases", tags=["Test Cases"])

DEFAULT_VALIDATE_POST_OPS = [
    {
        "type": "validate_response",
        "enabled": True,
        "expect_status": 200,
        "check_json_code": True,
    },
]

class AiGenerateRequest(BaseModel):
    interface_id: int
    save: bool = False
    scenarios: list[str] = []
    extra_requirement: str = ""

# ── 必须在 /{case_id} 之前注册，否则 FastAPI 会把 "ai-generate" 当成 case_id ──
@router.post("/ai-generate")
async def ai_generate_cases(req: AiGenerateRequest, db: Session = Depends(get_db)):
    """
    调用 DeepSeek 根据接口信息生成测试用例。
    save=true 时自动保存到数据库，否则仅返回预览数据。
    """
    interface = db.query(Interface).filter(Interface.id == req.interface_id).first()
    if not interface:
        raise HTTPException(status_code=404, detail="Interface not found")

    interface_info = {
        "name": interface.name,
        "method": interface.method.value if hasattr(interface.method, "value") else interface.method,
        "path": interface.path,
        "query_params": interface.query_params or [],
        "header_params": interface.header_params or [],
        "body_definition": interface.body_definition or {},
    }

    try:
        cases = await generate_test_cases(interface_info, req.scenarios, req.extra_requirement)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 生成失败: {str(e)}")

    if req.save:
        saved = []
        for c in cases:
            db_case = TestCase(
                interface_id=req.interface_id,
                name=c.get("name", "AI 生成用例"),
                case_type=c.get("case_type", "positive"),
                query_params=c.get("query_params"),
                header_params=c.get("header_params"),
                body_definition=c.get("body_definition"),
                assertions=c.get("assertions"),
                post_operations=list(DEFAULT_VALIDATE_POST_OPS),
            )
            db.add(db_case)
            db.flush()
            saved.append(db_case.id)
        db.commit()
        return {"code": 200, "msg": f"已生成并保存 {len(saved)} 条用例", "data": cases}

    return {"code": 200, "msg": f"已生成 {len(cases)} 条用例（预览，未保存）", "data": cases}


@router.post("", response_model=TestCaseResponse)
def create_test_case(test_case: TestCaseCreate, db: Session = Depends(get_db)):
    post_ops = test_case.post_operations
    if not post_ops:
        post_ops = list(DEFAULT_VALIDATE_POST_OPS)
    db_test_case = TestCase(
        interface_id=test_case.interface_id,
        name=test_case.name,
        case_type=test_case.case_type,
        query_params=test_case.query_params,
        header_params=test_case.header_params,
        body_definition=test_case.body_definition,
        assertions=test_case.assertions,
        post_operations=post_ops
    )
    db.add(db_test_case)
    db.commit()
    db.refresh(db_test_case)
    return TestCaseResponse(data=db_test_case)

@router.get("", response_model=TestCaseListResponse)
def list_test_cases(
    interface_id: Optional[int] = None,
    case_type: Optional[str] = None,
    exclude_case_type: Optional[str] = None,
    requirement_group_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = db.query(TestCase)
    if requirement_group_id is not None:
        query = query.filter(TestCase.requirement_group_id == requirement_group_id)
    else:
        # 默认仅返回接口自动化用例，避免与需求文档用例混在同一列表
        query = query.filter(TestCase.requirement_group_id.is_(None))
    if interface_id is not None:
        query = query.filter(TestCase.interface_id == interface_id)
    if case_type:
        query = query.filter(TestCase.case_type == case_type)
    if exclude_case_type:
        query = query.filter(TestCase.case_type != exclude_case_type)
    return TestCaseListResponse(data=query.all())


@router.get("/requirement-generated", response_model=ResponseModel)
def list_requirement_generated_cases(
    keyword: Optional[str] = None,
    doc_keyword: Optional[str] = Query(None, alias="docKeyword"),
    db: Session = Depends(get_db),
):
    """
    需求文档 AI 生成并落库的用例（requirement_group_id 非空），附带文档标题便于在「测试用例」页分区展示。
    """
    q = (
        db.query(TestCase, RequirementGroup)
        .join(RequirementGroup, TestCase.requirement_group_id == RequirementGroup.id)
        .order_by(RequirementGroup.upload_time.desc(), TestCase.id.asc())
    )
    if keyword and keyword.strip():
        kw = f"%{keyword.strip()}%"
        q = q.filter(TestCase.name.like(kw))
    if doc_keyword and doc_keyword.strip():
        dkw = f"%{doc_keyword.strip()}%"
        q = q.filter(RequirementGroup.doc_title.like(dkw))

    rows = q.all()
    out: List[Dict[str, Any]] = []
    for tc, g in rows:
        body = tc.body_definition if isinstance(tc.body_definition, dict) else {}
        out.append(
            {
                "id": tc.id,
                "requirementGroupId": tc.requirement_group_id,
                "docTitle": g.doc_title,
                "groupVersion": g.version,
                "name": tc.name,
                "caseType": tc.case_type,
                "priority": body.get("priority"),
                "kind": body.get("kind"),
                "steps": body.get("steps") or [],
            }
        )
    return ResponseModel(data=out)


@router.get("/{case_id}", response_model=TestCaseResponse)
def get_test_case(case_id: int, db: Session = Depends(get_db)):
    test_case = db.query(TestCase).filter(TestCase.id == case_id).first()
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    return TestCaseResponse(data=test_case)

@router.patch("/{case_id}", response_model=TestCaseResponse)
def update_test_case(case_id: int, test_case: TestCaseUpdate, db: Session = Depends(get_db)):
    db_test_case = db.query(TestCase).filter(TestCase.id == case_id).first()
    if not db_test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    
    update_data = test_case.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_test_case, key, value)
        
    db.commit()
    db.refresh(db_test_case)
    return TestCaseResponse(data=db_test_case)

@router.delete("/{case_id}", response_model=ResponseModel)
def delete_test_case(case_id: int, db: Session = Depends(get_db)):
    db_test_case = db.query(TestCase).filter(TestCase.id == case_id).first()
    if not db_test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    
    db.delete(db_test_case)
    db.commit()
    return ResponseModel(msg="Test case deleted")
