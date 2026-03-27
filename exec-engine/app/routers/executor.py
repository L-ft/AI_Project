from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.api_mgmt import Interface, TestCase, Environment
from ..executor.playwright_runner import run_api_test
from typing import Optional, Dict, Any

router = APIRouter(prefix="/executor", tags=["Executor"])

@router.post("/run-interface/{interface_id}")
async def run_interface(interface_id: int, env_id: Optional[int] = None, db: Session = Depends(get_db)):
    interface = db.query(Interface).filter(Interface.id == interface_id).first()
    if not interface:
        raise HTTPException(status_code=404, detail="Interface not found")
    
    env_base_url = ""
    if env_id:
        env = db.query(Environment).filter(Environment.id == env_id).first()
        if env:
            env_base_url = env.base_url

    # 构建运行数据
    api_definition = {
        "name": interface.name,
        "method": interface.method,
        "url": f"{env_base_url}{interface.path}",
        "headers": {p["name"]: p["value"] for p in (interface.header_params or [])},
        "params": {p["name"]: p["value"] for p in (interface.query_params or [])},
        "body": interface.body_definition
    }
    
    result = await run_api_test(api_definition)
    return result

@router.post("/run-test-case/{case_id}")
async def run_test_case(case_id: int, env_id: Optional[int] = None, db: Session = Depends(get_db)):
    test_case = db.query(TestCase).filter(TestCase.id == case_id).first()
    if not test_case:
        raise HTTPException(status_code=404, detail="Test case not found")
    
    interface = test_case.interface
    env_base_url = ""
    if env_id:
        env = db.query(Environment).filter(Environment.id == env_id).first()
        if env:
            env_base_url = env.base_url

    # 合并接口与用例的参数
    headers = {p["name"]: p["value"] for p in (interface.header_params or [])}
    if test_case.header_params:
        headers.update({p["name"]: p["value"] for p in test_case.header_params})
        
    params = {p["name"]: p["value"] for p in (interface.query_params or [])}
    if test_case.query_params:
        params.update({p["name"]: p["value"] for p in test_case.query_params})
        
    body = test_case.body_definition if test_case.body_definition else interface.body_definition

    api_definition = {
        "name": f"{interface.name} - {test_case.name}",
        "method": interface.method,
        "url": f"{env_base_url}{interface.path}",
        "headers": headers,
        "params": params,
        "body": body,
        "assertions": test_case.assertions
    }
    
    result = await run_api_test(api_definition)
    return result
