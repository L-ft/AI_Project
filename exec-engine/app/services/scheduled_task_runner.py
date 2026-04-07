from __future__ import annotations

import asyncio
import logging
import threading
from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Any, Dict, List, Optional

from croniter import croniter
from fastapi import HTTPException
from sqlalchemy.orm import Session
from zoneinfo import ZoneInfo

from ..core.resource_codes import normalize_external_ref
from ..models.api_mgmt import Environment, ScheduledTask, ScheduledTaskRun, TestScenario
from ..repositories.api_mgmt import (
    InterfaceRepository,
    ReportRepository,
    ScenarioRepository,
    TestCaseRepository,
)
from ..services.api_mgmt import ExecutorService, ScenarioService

logger = logging.getLogger(__name__)

_task_locks: dict[int, threading.Lock] = {}
_lock_guard = threading.Lock()


def _lock_for(task_id: int) -> threading.Lock:
    with _lock_guard:
        if task_id not in _task_locks:
            _task_locks[task_id] = threading.Lock()
        return _task_locks[task_id]


def utc_now_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


def compute_next_run_utc_naive(
    cron_expr: str, tz_name: str, after_utc_naive: Optional[datetime] = None
) -> datetime:
    tz = ZoneInfo(tz_name or "Asia/Shanghai")
    base = after_utc_naive or utc_now_naive()
    if base.tzinfo is None:
        base_aware = base.replace(tzinfo=timezone.utc).astimezone(tz)
    else:
        base_aware = base.astimezone(tz)
    itr = croniter(cron_expr, base_aware)
    nxt = itr.get_next(datetime)
    if nxt.tzinfo is None:
        nxt = nxt.replace(tzinfo=tz)
    return nxt.astimezone(timezone.utc).replace(tzinfo=None)


def validate_cron(cron_expr: str) -> None:
    base = datetime.now(timezone.utc)
    croniter(cron_expr, base)


def _playwright_result_to_entry(step_name: str, res: Dict[str, Any]) -> Dict[str, Any]:
    success = bool(res.get("success"))
    elapsed = res.get("elapsed")
    status_code = res.get("status_code")
    err = res.get("error_log")
    return {
        "pass": success,
        "name": step_name or "步骤",
        "method": "HTTP",
        "url": (res.get("log") or "")[:2000],
        "statusCode": status_code,
        "elapsedMs": elapsed,
        "error": err if not success else None,
    }


async def execute_scenario_for_schedule(
    scenario_code: str,
    creator: str,
    report_title: str,
) -> Dict[str, Any]:
    """独立会话中执行场景步骤并写入报告，供定时任务与手动触发共用。"""
    from ..database import SessionLocal

    db = SessionLocal()
    try:
        scenario_repo = ScenarioRepository(db)
        report_repo = ReportRepository(db)
        env_repo = EnvironmentRepository(db)
        executor = ExecutorService(
            InterfaceRepository(db),
            TestCaseRepository(db),
            env_repo,
        )
        scenario_service = ScenarioService(scenario_repo, report_repo, env_repo)

        scenario = scenario_repo.get_by_ref(scenario_code)
        if not scenario:
            raise ValueError("测试场景不存在或已删除")

        env_code: Optional[str] = None
        if scenario.env_id is not None:
            env_row = db.query(Environment).filter(Environment.id == scenario.env_id).first()
            if env_row and env_row.code:
                env_code = env_row.code

        steps = list(scenario.steps or [])

        def _order_key(s: Dict[str, Any]) -> Any:
            o = s.get("order")
            try:
                return int(o) if o is not None else 0
            except (TypeError, ValueError):
                return 0

        steps.sort(key=_order_key)

        entries: List[Dict[str, Any]] = []

        for step in steps:
            if not isinstance(step, dict):
                continue
            name = str(step.get("name") or "未命名步骤").strip() or "未命名步骤"
            case_ref = normalize_external_ref(
                step.get("caseCode") or step.get("case_id") or step.get("caseId")
            )
            iface_ref = normalize_external_ref(
                step.get("interfaceCode") or step.get("interface_id") or step.get("interfaceId")
            )

            src = str(step.get("source") or "").lower()
            if src in ("curl", "script", "db", "delay"):
                entries.append(
                    {
                        "pass": False,
                        "name": name,
                        "method": "—",
                        "url": "scheduler://unsupported",
                        "statusCode": None,
                        "elapsedMs": 0,
                        "error": "定时任务不支持此类步骤，请在「自动化测试」中手动执行",
                    }
                )
                continue

            try:
                if case_ref:
                    res = await executor.run_test_case(case_ref, env_code)
                elif iface_ref:
                    res = await executor.run_interface(iface_ref, env_code)
                else:
                    entries.append(
                        {
                            "pass": False,
                            "name": name,
                            "method": "—",
                            "url": "—",
                            "statusCode": None,
                            "elapsedMs": None,
                            "error": "步骤未绑定接口或用例",
                        }
                    )
                    continue
                if not isinstance(res, dict):
                    res = {}
                entries.append(_playwright_result_to_entry(name, res))
            except HTTPException as he:
                entries.append(
                    {
                        "pass": False,
                        "name": name,
                        "method": "—",
                        "url": "—",
                        "statusCode": getattr(he, "status_code", None),
                        "elapsedMs": None,
                        "error": str(he.detail) if getattr(he, "detail", None) is not None else str(he),
                    }
                )
            except Exception as exc:
                logger.exception("scheduled step failed")
                entries.append(
                    {
                        "pass": False,
                        "name": name,
                        "method": "—",
                        "url": "—",
                        "statusCode": None,
                        "elapsedMs": None,
                        "error": str(exc),
                    }
                )

        summary = scenario_service._summarize_report_entries(entries)
        body = SimpleNamespace(
            entries=entries,
            summary=summary,
            trigger_type="scheduled",
            title=report_title,
            creator=creator,
            env_id=env_code,
        )
        scenario_service.create_scenario_report(scenario_code, body)

        pass_n = int(summary.get("pass") or 0)
        fail_n = int(summary.get("fail") or 0)
        sum_ms = float(summary.get("sum_ms") or 0)
        lr_status = "failed" if fail_n > 0 else "passed"
        finished = datetime.utcnow().isoformat() + "Z"

        scenario2 = scenario_repo.get_by_ref(scenario_code)
        if scenario2:
            scenario2.last_result = {
                "status": lr_status,
                "passed": pass_n,
                "failed": fail_n,
                "duration": sum_ms / 1000.0 if sum_ms else 0,
                "finished_at": finished,
                "trigger": "scheduled",
            }
            scenario_repo.save(scenario2)

        latest = report_repo.list_by_scenario(scenario2.id if scenario2 else scenario.id, 0, 1)
        report_code = latest[0].code if latest else None

        return {"report_code": report_code, "summary": summary, "status": lr_status}
    finally:
        db.close()


async def _run_async_task(task_id: int, advance_schedule: bool, force_run: bool = False) -> None:
    from ..database import SessionLocal

    db = SessionLocal()
    run_id: Optional[int] = None
    lock = _lock_for(task_id)
    try:
        task = db.query(ScheduledTask).filter(ScheduledTask.id == task_id).first()
        if not task or (not task.enabled and not force_run):
            return

        if not lock.acquire(blocking=False):
            return

        try:
            run_row = ScheduledTaskRun(task_id=task.id, status="running", started_at=utc_now_naive())
            db.add(run_row)
            db.commit()
            db.refresh(run_row)
            run_id = run_row.id

            title = f"[定时] {task.name}"
            result = await execute_scenario_for_schedule(
                task.scenario_code,
                "scheduler",
                title,
            )

            run_u = db.query(ScheduledTaskRun).filter(ScheduledTaskRun.id == run_id).first()
            if run_u:
                run_u.status = "success" if result.get("status") == "passed" else "failed"
                run_u.message = None
                run_u.report_code = result.get("report_code")
                run_u.finished_at = utc_now_naive()

            task_u = db.query(ScheduledTask).filter(ScheduledTask.id == task_id).first()
            if task_u:
                task_u.last_run_at = run_u.finished_at if run_u else utc_now_naive()
                task_u.last_run_status = result.get("status")
                if advance_schedule:
                    task_u.next_run_at = compute_next_run_utc_naive(
                        task_u.cron_expression, task_u.timezone, utc_now_naive()
                    )

            db.commit()
        except Exception as exc:
            logger.exception("scheduled task failed")
            db.rollback()
            try:
                run_u = db.query(ScheduledTaskRun).filter(ScheduledTaskRun.id == run_id).first() if run_id else None
                task_u = db.query(ScheduledTask).filter(ScheduledTask.id == task_id).first()
                if run_u:
                    run_u.status = "failed"
                    run_u.message = str(exc)
                    run_u.finished_at = utc_now_naive()
                if task_u:
                    task_u.last_run_at = utc_now_naive()
                    task_u.last_run_status = "failed"
                    if advance_schedule:
                        task_u.next_run_at = compute_next_run_utc_naive(
                            task_u.cron_expression, task_u.timezone, utc_now_naive()
                        )
                db.commit()
            except Exception:
                logger.exception("persist scheduled task failure")
                db.rollback()
        finally:
            lock.release()
    finally:
        db.close()


def process_due_scheduled_tasks() -> None:
    from ..database import SessionLocal

    db = SessionLocal()
    try:
        now = utc_now_naive()
        ids = [
            row[0]
            for row in (
                db.query(ScheduledTask.id)
                .filter(
                    ScheduledTask.enabled == True,  # noqa: E712
                    ScheduledTask.next_run_at.isnot(None),
                    ScheduledTask.next_run_at <= now,
                )
                .all()
            )
        ]
    finally:
        db.close()

    for tid in ids:
        asyncio.run(_run_async_task(tid, advance_schedule=True, force_run=False))


def trigger_task_now(task_code: str) -> Dict[str, Any]:
    """立即执行一次（不改变下次调度时间，仅更新最近运行信息）。"""
    from ..database import SessionLocal

    db = SessionLocal()
    try:
        task = db.query(ScheduledTask).filter(ScheduledTask.code == task_code).first()
        if not task:
            raise ValueError("定时任务不存在")
        tid = task.id
    finally:
        db.close()

    asyncio.run(_run_async_task(tid, advance_schedule=False, force_run=True))

    db = SessionLocal()
    try:
        task = db.query(ScheduledTask).filter(ScheduledTask.id == tid).first()
        last = (
            db.query(ScheduledTaskRun)
            .filter(ScheduledTaskRun.task_id == tid)
            .order_by(ScheduledTaskRun.started_at.desc())
            .first()
        )
        return {
            "task_code": task.code,
            "last_run_status": task.last_run_status if task else None,
            "run": (
                {
                    "status": last.status,
                    "message": last.message,
                    "report_code": last.report_code,
                    "started_at": last.started_at.isoformat() if last.started_at else None,
                }
                if last
                else None
            ),
        }
    finally:
        db.close()
