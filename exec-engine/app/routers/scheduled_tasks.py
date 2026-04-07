from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import AliasChoices, BaseModel, Field
from sqlalchemy.orm import Session

from ..core.auth import require_auth
from ..core.resource_codes import build_resource_code, is_valid_resource_code
from ..database import get_db
from ..models.api_mgmt import ScheduledTask, ScheduledTaskRun
from ..repositories.api_mgmt import ScenarioRepository
from ..services.scheduled_task_runner import (
    compute_next_run_utc_naive,
    trigger_task_now,
    utc_now_naive,
    validate_cron,
)

router = APIRouter(
    prefix="/scheduled-tasks",
    tags=["Scheduled Tasks"],
    dependencies=[Depends(require_auth)],
)


class ScheduledTaskCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    scenario_code: str = Field(..., validation_alias=AliasChoices("scenario_code", "scenarioCode"))
    cron_expression: str = Field(
        ...,
        min_length=1,
        max_length=128,
        validation_alias=AliasChoices("cron_expression", "cronExpression"),
    )
    timezone: str = Field(default="Asia/Shanghai", max_length=64)
    enabled: bool = True
    description: Optional[str] = None


class ScheduledTaskUpdate(BaseModel):
    name: Optional[str] = Field(default=None, max_length=255)
    scenario_code: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("scenario_code", "scenarioCode"),
    )
    cron_expression: Optional[str] = Field(
        default=None,
        max_length=128,
        validation_alias=AliasChoices("cron_expression", "cronExpression"),
    )
    timezone: Optional[str] = Field(default=None, max_length=64)
    enabled: Optional[bool] = None
    description: Optional[str] = None


def _serialize_task(row: ScheduledTask) -> Dict[str, Any]:
    return {
        "id": row.id,
        "code": row.code,
        "name": row.name,
        "scenario_code": row.scenario_code,
        "scenarioCode": row.scenario_code,
        "cron_expression": row.cron_expression,
        "cronExpression": row.cron_expression,
        "timezone": row.timezone,
        "enabled": row.enabled,
        "description": row.description,
        "last_run_at": row.last_run_at.isoformat() if row.last_run_at else None,
        "lastRunAt": row.last_run_at.isoformat() if row.last_run_at else None,
        "next_run_at": row.next_run_at.isoformat() if row.next_run_at else None,
        "nextRunAt": row.next_run_at.isoformat() if row.next_run_at else None,
        "last_run_status": row.last_run_status,
        "lastRunStatus": row.last_run_status,
        "created_at": row.created_at.isoformat() if row.created_at else None,
        "createdAt": row.created_at.isoformat() if row.created_at else None,
        "updated_at": row.updated_at.isoformat() if row.updated_at else None,
        "updatedAt": row.updated_at.isoformat() if row.updated_at else None,
    }


def _serialize_run(row: ScheduledTaskRun) -> Dict[str, Any]:
    return {
        "id": row.id,
        "status": row.status,
        "message": row.message,
        "report_code": row.report_code,
        "reportCode": row.report_code,
        "started_at": row.started_at.isoformat() if row.started_at else None,
        "startedAt": row.started_at.isoformat() if row.started_at else None,
        "finished_at": row.finished_at.isoformat() if row.finished_at else None,
        "finishedAt": row.finished_at.isoformat() if row.finished_at else None,
    }


@router.get("")
def list_scheduled_tasks(
    db: Session = Depends(get_db),
    scenario_code: Optional[str] = None,
):
    q = db.query(ScheduledTask).order_by(ScheduledTask.id.desc())
    if scenario_code:
        q = q.filter(ScheduledTask.scenario_code == scenario_code)
    rows = q.all()
    return {"code": 200, "data": [_serialize_task(r) for r in rows], "msg": "success"}


@router.post("")
def create_scheduled_task(body: ScheduledTaskCreate, db: Session = Depends(get_db)):
    try:
        validate_cron(body.cron_expression.strip())
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Cron 表达式无效: {exc}") from exc

    scenario_repo = ScenarioRepository(db)
    if not scenario_repo.get_by_ref(body.scenario_code.strip()):
        raise HTTPException(status_code=400, detail="测试场景不存在")

    row = ScheduledTask(
        name=body.name.strip(),
        scenario_code=body.scenario_code.strip(),
        cron_expression=body.cron_expression.strip(),
        timezone=(body.timezone or "Asia/Shanghai").strip(),
        enabled=body.enabled,
        description=body.description,
    )
    db.add(row)
    db.commit()
    db.refresh(row)

    if not is_valid_resource_code(row.code):
        row.code = build_resource_code("sched-task", preferred=row.name, entity_id=row.id)
        row.updated_at = datetime.utcnow()
        db.add(row)
        db.commit()
        db.refresh(row)

    row.next_run_at = compute_next_run_utc_naive(row.cron_expression, row.timezone, utc_now_naive())
    db.add(row)
    db.commit()
    db.refresh(row)

    return {"code": 200, "data": _serialize_task(row), "msg": "created"}


@router.patch("/{task_code}")
def update_scheduled_task(
    task_code: str,
    body: ScheduledTaskUpdate,
    db: Session = Depends(get_db),
):
    row = db.query(ScheduledTask).filter(ScheduledTask.code == task_code).first()
    if not row:
        raise HTTPException(status_code=404, detail="定时任务不存在")

    patch = body.model_dump(exclude_unset=True)
    scenario_repo = ScenarioRepository(db)
    recompute_next = False

    if "scenario_code" in patch and patch["scenario_code"]:
        sc = str(patch["scenario_code"]).strip()
        if not scenario_repo.get_by_ref(sc):
            raise HTTPException(status_code=400, detail="测试场景不存在")
        row.scenario_code = sc

    if "cron_expression" in patch and patch["cron_expression"]:
        try:
            validate_cron(str(patch["cron_expression"]).strip())
        except Exception as exc:
            raise HTTPException(status_code=400, detail=f"Cron 表达式无效: {exc}") from exc
        row.cron_expression = str(patch["cron_expression"]).strip()
        recompute_next = True

    if "timezone" in patch and patch["timezone"]:
        row.timezone = str(patch["timezone"]).strip()
        recompute_next = True

    if "name" in patch and patch["name"] is not None:
        row.name = str(patch["name"]).strip()
    if "enabled" in patch and patch["enabled"] is not None:
        row.enabled = bool(patch["enabled"])
    if "description" in patch:
        row.description = patch["description"]

    if recompute_next:
        row.next_run_at = compute_next_run_utc_naive(row.cron_expression, row.timezone, utc_now_naive())

    row.updated_at = datetime.utcnow()
    db.add(row)
    db.commit()
    db.refresh(row)

    return {"code": 200, "data": _serialize_task(row), "msg": "updated"}


@router.delete("/{task_code}")
def delete_scheduled_task(task_code: str, db: Session = Depends(get_db)):
    row = db.query(ScheduledTask).filter(ScheduledTask.code == task_code).first()
    if not row:
        raise HTTPException(status_code=404, detail="定时任务不存在")
    db.delete(row)
    db.commit()
    return {"code": 200, "msg": "deleted"}


@router.post("/{task_code}/trigger")
def trigger_scheduled_task(task_code: str):
    try:
        data = trigger_task_now(task_code)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    return {"code": 200, "data": data, "msg": "triggered"}


@router.get("/{task_code}/runs")
def list_task_runs(
    task_code: str,
    db: Session = Depends(get_db),
    limit: int = 50,
):
    task = db.query(ScheduledTask).filter(ScheduledTask.code == task_code).first()
    if not task:
        raise HTTPException(status_code=404, detail="定时任务不存在")
    rows = (
        db.query(ScheduledTaskRun)
        .filter(ScheduledTaskRun.task_id == task.id)
        .order_by(ScheduledTaskRun.started_at.desc())
        .limit(min(limit, 200))
        .all()
    )
    return {"code": 200, "data": [_serialize_run(r) for r in rows], "msg": "success"}
