from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Query
from pydantic import AliasChoices, BaseModel, Field

from ..core.auth import require_auth
from ..dependencies import get_scenario_service
from ..services.api_mgmt import ScenarioService


router = APIRouter(
    prefix="/test-scenarios",
    tags=["Test Scenarios"],
    dependencies=[Depends(require_auth)],
)


class ScenarioCreate(BaseModel):
    name: str
    priority: str = "P0"
    tags: Optional[str] = None
    env_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("env_id", "envId", "envCode"),
    )
    description: Optional[str] = None
    steps: Optional[list] = []
    creator: Optional[str] = ""


class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[str] = None
    env_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("env_id", "envId", "envCode"),
    )
    description: Optional[str] = None
    steps: Optional[list] = None
    last_result: Optional[Dict[str, Any]] = None


class ScenarioSchema(BaseModel):
    id: str
    name: str
    priority: str
    tags: Optional[str] = None
    env_id: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[list] = []
    last_result: Optional[dict] = None
    creator: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScenarioReportCreate(BaseModel):
    entries: list[Dict[str, Any]] = Field(default_factory=list)
    summary: Optional[Dict[str, Any]] = None
    env_id: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("env_id", "envId", "envCode"),
    )
    trigger_type: str = "manual"
    title: Optional[str] = None
    creator: Optional[str] = ""


@router.get("/reports")
def list_all_reports(
    q: Optional[str] = None,
    scenario_id: Optional[str] = None,
    scenario_code: Optional[str] = Query(None, alias="scenarioCode"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    service: ScenarioService = Depends(get_scenario_service),
):
    return {
        "code": 200,
        "data": service.list_all_reports(q, scenario_code or scenario_id, skip, limit),
        "msg": "success",
    }


@router.get("/reports/{report_code}")
def get_report_detail(
    report_code: str,
    service: ScenarioService = Depends(get_scenario_service),
):
    return {"code": 200, "data": service.get_report_detail(report_code), "msg": "success"}


@router.get("/{scenario_code}/reports")
def list_scenario_reports(
    scenario_code: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    service: ScenarioService = Depends(get_scenario_service),
):
    return {"code": 200, "data": service.list_scenario_reports(scenario_code, skip, limit), "msg": "success"}


@router.post("/{scenario_code}/reports")
def create_scenario_report(
    scenario_code: str,
    body: ScenarioReportCreate,
    service: ScenarioService = Depends(get_scenario_service),
):
    return {"code": 200, "data": service.create_scenario_report(scenario_code, body), "msg": "Report saved"}


@router.get("")
def list_scenarios(service: ScenarioService = Depends(get_scenario_service)):
    return {"code": 200, "data": service.list_scenarios(), "msg": "success"}


@router.post("")
def create_scenario(
    body: ScenarioCreate,
    service: ScenarioService = Depends(get_scenario_service),
):
    return {"code": 200, "data": service.create_scenario(body), "msg": "Scenario created"}


@router.get("/{scenario_code}")
def get_scenario(
    scenario_code: str,
    service: ScenarioService = Depends(get_scenario_service),
):
    return {"code": 200, "data": service.get_scenario_detail(scenario_code), "msg": "success"}


@router.patch("/{scenario_code}")
def update_scenario(
    scenario_code: str,
    body: ScenarioUpdate,
    service: ScenarioService = Depends(get_scenario_service),
):
    service.update_scenario(scenario_code, body)
    return {"code": 200, "msg": "Scenario updated"}


@router.delete("/{scenario_code}")
def delete_scenario(
    scenario_code: str,
    service: ScenarioService = Depends(get_scenario_service),
):
    service.delete_scenario(scenario_code)
    return {"code": 200, "msg": "Scenario deleted"}


@router.post("/{scenario_code}/run")
async def run_scenario(
    scenario_code: str,
    service: ScenarioService = Depends(get_scenario_service),
):
    return {"code": 200, "msg": "Scenario started", "data": service.run_scenario(scenario_code)}
