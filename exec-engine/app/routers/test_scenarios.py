from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime
import math

from ..database import get_db
from ..models.api_mgmt import TestScenario, Environment, ScenarioTestReport

router = APIRouter(prefix="/test-scenarios", tags=["Test Scenarios"])


# ── Schemas ────────────────────────────────────────────────────────

class ScenarioCreate(BaseModel):
    name: str
    priority: str = "P0"
    tags: Optional[str] = None
    env_id: Optional[int] = None
    description: Optional[str] = None
    steps: Optional[list] = []
    creator: Optional[str] = ""


class ScenarioUpdate(BaseModel):
    name: Optional[str] = None
    priority: Optional[str] = None
    tags: Optional[str] = None
    env_id: Optional[int] = None
    description: Optional[str] = None
    steps: Optional[list] = None
    # 最近一次执行快照：{ status, passed, failed, duration, finished_at?, ... }
    last_result: Optional[Dict[str, Any]] = None


class ScenarioSchema(BaseModel):
    id: int
    name: str
    priority: str
    tags: Optional[str] = None
    env_id: Optional[int] = None
    description: Optional[str] = None
    steps: Optional[list] = []
    last_result: Optional[dict] = None
    creator: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


def _derive_status_from_report_summary(summary: Optional[Dict[str, Any]]) -> str:
    """由报告 summary 推导列表用状态：与 last_result.status 取值对齐。"""
    s = summary or {}
    fail_n = int(s.get("fail") or 0)
    pass_n = int(s.get("pass") or 0)
    total = fail_n + pass_n
    if total == 0:
        return "unknown"
    return "failed" if fail_n > 0 else "passed"


def _last_report_public_dict(r: ScenarioTestReport) -> Dict[str, Any]:
    summ = r.summary or {}
    return {
        "id": r.id,
        "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else None,
        "trigger_type": r.trigger_type or "manual",
        "summary": summ,
        "status": _derive_status_from_report_summary(summ),
    }


def _latest_report_rows_for_scenarios(db: Session, scenario_ids: List[int]) -> Dict[int, ScenarioTestReport]:
    """每个场景 id 对应一条最新测试报告（按 id 最大，即通常最新插入）。"""
    if not scenario_ids:
        return {}
    R = ScenarioTestReport
    subq = (
        db.query(R.scenario_id, func.max(R.id).label("max_id"))
        .filter(R.scenario_id.in_(scenario_ids))
        .group_by(R.scenario_id)
        .subquery()
    )
    rows = (
        db.query(R)
        .join(subq, R.id == subq.c.max_id)
        .all()
    )
    return {r.scenario_id: r for r in rows}


def _summarize_report_entries(entries: List[Dict[str, Any]]) -> Dict[str, Any]:
    total = len(entries)
    pass_n = sum(1 for e in entries if e.get("pass") is True)
    fail_n = total - pass_n
    sum_ms = 0.0
    n_ms = 0
    for e in entries:
        em = e.get("elapsedMs")
        if em is not None:
            try:
                v = float(em)
                if not math.isnan(v):
                    sum_ms += v
                    n_ms += 1
            except (TypeError, ValueError):
                pass
    return {
        "total": total,
        "pass": pass_n,
        "fail": fail_n,
        "untested": 0,
        "sum_ms": sum_ms,
        "avg_ms": (sum_ms / n_ms) if n_ms else 0.0,
        "n_ms": n_ms,
    }


class ScenarioReportCreate(BaseModel):
    entries: List[Dict[str, Any]] = Field(default_factory=list)
    summary: Optional[Dict[str, Any]] = None
    env_id: Optional[int] = None
    trigger_type: str = "manual"
    title: Optional[str] = None
    creator: Optional[str] = ""


def _env_name(db: Session, env_id: Optional[int]) -> Optional[str]:
    if env_id is None:
        return None
    env = db.query(Environment).filter(Environment.id == env_id).first()
    return env.name if env else None


def _report_to_dict(db: Session, r: ScenarioTestReport, include_entries: bool = True) -> dict:
    s = db.query(TestScenario).filter(TestScenario.id == r.scenario_id).first()
    scenario_name = s.name if s else ""
    env_name = _env_name(db, r.env_id)
    out = {
        "id": r.id,
        "scenario_id": r.scenario_id,
        "scenario_name": scenario_name,
        "env_id": r.env_id,
        "env_name": env_name,
        "creator": r.creator or "",
        "trigger_type": r.trigger_type or "manual",
        "title": r.title,
        "summary": r.summary or {},
        "created_at": r.created_at.strftime("%Y-%m-%d %H:%M:%S") if r.created_at else None,
    }
    if include_entries:
        out["entries"] = r.entries or []
    return out


# ── 测试报告（须注册在 /{scenario_id} 之前，避免被 int 路径吞掉）──

@router.get("/reports")
def list_all_reports(
    db: Session = Depends(get_db),
    q: Optional[str] = None,
    scenario_id: Optional[int] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
):
    """全局测试报告列表，支持按场景、关键字过滤。"""
    query = db.query(ScenarioTestReport).order_by(ScenarioTestReport.created_at.desc())
    if scenario_id is not None:
        query = query.filter(ScenarioTestReport.scenario_id == scenario_id)
    qn = (q or "").strip().lower()
    if not qn:
        rows = query.offset(skip).limit(limit).all()
        out = [_report_to_dict(db, r, include_entries=False) for r in rows]
        return {"code": 200, "data": out, "msg": "success"}
    rows = query.offset(skip).limit(limit * 5).all()
    out = []
    for r in rows:
        d = _report_to_dict(db, r, include_entries=False)
        blob = " ".join(
            [
                d.get("scenario_name") or "",
                d.get("creator") or "",
                str(d.get("title") or ""),
                str(d.get("summary") or ""),
            ]
        ).lower()
        if qn not in blob:
            continue
        out.append(d)
        if len(out) >= limit:
            break
    return {"code": 200, "data": out, "msg": "success"}


@router.get("/reports/{report_id}")
def get_report_detail(report_id: int, db: Session = Depends(get_db)):
    r = db.query(ScenarioTestReport).filter(ScenarioTestReport.id == report_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return {"code": 200, "data": _report_to_dict(db, r, include_entries=True), "msg": "success"}


@router.get("/{scenario_id}/reports")
def list_scenario_reports(
    scenario_id: int,
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
):
    s = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    rows = (
        db.query(ScenarioTestReport)
        .filter(ScenarioTestReport.scenario_id == scenario_id)
        .order_by(ScenarioTestReport.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return {
        "code": 200,
        "data": [_report_to_dict(db, r, include_entries=False) for r in rows],
        "msg": "success",
    }


@router.post("/{scenario_id}/reports")
def create_scenario_report(
    scenario_id: int,
    body: ScenarioReportCreate,
    db: Session = Depends(get_db),
):
    s = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    entries = body.entries or []
    summary = body.summary if body.summary else _summarize_report_entries(entries)
    if "total" not in summary and entries:
        summary = {**_summarize_report_entries(entries), **summary}
    r = ScenarioTestReport(
        scenario_id=scenario_id,
        env_id=body.env_id if body.env_id is not None else s.env_id,
        creator=body.creator or "",
        trigger_type=body.trigger_type or "manual",
        title=body.title,
        summary=summary,
        entries=entries,
    )
    db.add(r)
    db.commit()
    db.refresh(r)
    return {
        "code": 200,
        "data": {"id": r.id, "summary": r.summary},
        "msg": "报告已保存",
    }


# ── CRUD ──────────────────────────────────────────────────────────

@router.get("")
def list_scenarios(db: Session = Depends(get_db)):
    scenarios = db.query(TestScenario).order_by(TestScenario.created_at.desc()).all()
    ids = [s.id for s in scenarios]
    latest_by_sid = _latest_report_rows_for_scenarios(db, ids)
    result = []
    for s in scenarios:
        env_name = None
        if s.env_id:
            env = db.query(Environment).filter(Environment.id == s.env_id).first()
            env_name = env.name if env else None
        lr = latest_by_sid.get(s.id)
        item = {
            "id": s.id,
            "name": s.name,
            "priority": s.priority.value if hasattr(s.priority, "value") else s.priority,
            "tags": s.tags,
            "env_id": s.env_id,
            "env_name": env_name,
            "description": s.description,
            "steps": s.steps or [],
            "last_result": s.last_result,
            "last_report": _last_report_public_dict(lr) if lr else None,
            "creator": s.creator,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else None,
            "updated_at": s.updated_at.strftime("%Y-%m-%d %H:%M:%S") if s.updated_at else None,
        }
        result.append(item)
    return {"code": 200, "data": result, "msg": "success"}


@router.post("")
def create_scenario(body: ScenarioCreate, db: Session = Depends(get_db)):
    scenario = TestScenario(
        name=body.name,
        priority=body.priority,
        tags=body.tags,
        env_id=body.env_id,
        description=body.description,
        steps=body.steps or [],
        creator=body.creator or "",
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return {"code": 200, "data": {"id": scenario.id}, "msg": "创建成功"}


@router.get("/{scenario_id}")
def get_scenario(scenario_id: int, db: Session = Depends(get_db)):
    s = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    env_name = None
    if s.env_id:
        env = db.query(Environment).filter(Environment.id == s.env_id).first()
        env_name = env.name if env else None
    latest_by_sid = _latest_report_rows_for_scenarios(db, [scenario_id])
    lr = latest_by_sid.get(scenario_id)
    return {
        "code": 200,
        "data": {
            "id": s.id, "name": s.name,
            "priority": s.priority.value if hasattr(s.priority, "value") else s.priority,
            "tags": s.tags, "env_id": s.env_id, "env_name": env_name,
            "description": s.description, "steps": s.steps or [],
            "last_result": s.last_result,
            "last_report": _last_report_public_dict(lr) if lr else None,
            "creator": s.creator,
            "created_at": s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else None,
        },
        "msg": "success"
    }


@router.patch("/{scenario_id}")
def update_scenario(scenario_id: int, body: ScenarioUpdate, db: Session = Depends(get_db)):
    s = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    for field, val in body.model_dump(exclude_none=True).items():
        setattr(s, field, val)
    db.commit()
    return {"code": 200, "msg": "更新成功"}


@router.delete("/{scenario_id}")
def delete_scenario(scenario_id: int, db: Session = Depends(get_db)):
    s = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    db.delete(s)
    db.commit()
    return {"code": 200, "msg": "删除成功"}


@router.post("/{scenario_id}/run")
async def run_scenario(scenario_id: int, db: Session = Depends(get_db)):
    """触发场景运行（异步，立即返回 running 状态）"""
    s = db.query(TestScenario).filter(TestScenario.id == scenario_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scenario not found")
    s.last_result = {"status": "running", "passed": 0, "failed": 0, "duration": 0}
    db.commit()
    return {"code": 200, "msg": "已开始运行", "data": {"status": "running"}}
