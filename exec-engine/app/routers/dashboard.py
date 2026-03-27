"""
仪表盘聚合：接口/用例/场景数量、基于场景测试报告的执行成功率、近 7 日趋势。
"""
from datetime import datetime, timedelta, date
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.api_mgmt import Interface, TestCase, TestScenario, ScenarioTestReport

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


def _report_date(created_at: Any) -> Optional[date]:
    if created_at is None:
        return None
    if hasattr(created_at, "date"):
        return created_at.date()
    return None


def _sum_report_summary(r: ScenarioTestReport) -> tuple[int, int]:
    s = r.summary or {}
    p = int(s.get("pass") or 0)
    f = int(s.get("fail") or 0)
    return p, f


@router.get("/overview")
def dashboard_overview(db: Session = Depends(get_db)):
    interface_count = db.query(Interface).count()
    test_case_count = db.query(TestCase).count()
    scenario_count = db.query(TestScenario).count()

    all_reports: List[ScenarioTestReport] = db.query(ScenarioTestReport).all()
    total_pass_steps = 0
    total_fail_steps = 0
    for r in all_reports:
        p, f = _sum_report_summary(r)
        total_pass_steps += p
        total_fail_steps += f

    denom = total_pass_steps + total_fail_steps
    execution_success_rate = (
        round(100.0 * total_pass_steps / denom, 2) if denom > 0 else None
    )

    # 场景最近运行态（来自批量/运行接口写入的 last_result）
    scenarios_running = 0
    scenarios_failed = 0
    for s in db.query(TestScenario).all():
        lr = s.last_result or {}
        st = lr.get("status")
        if st == "running":
            scenarios_running += 1
        elif st == "failed":
            scenarios_failed += 1

    # 近 7 日（含今天）按 UTC 日期聚合
    end_d = datetime.utcnow().date()
    start_d = end_d - timedelta(days=6)
    weekdays_cn = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]

    day_buckets: Dict[date, Dict[str, int]] = {}
    for i in range(7):
        d = start_d + timedelta(days=i)
        day_buckets[d] = {"report_count": 0, "pass_steps": 0, "fail_steps": 0}

    for r in all_reports:
        rd = _report_date(r.created_at)
        if rd is None or rd < start_d or rd > end_d:
            continue
        if rd not in day_buckets:
            continue
        day_buckets[rd]["report_count"] += 1
        p, f = _sum_report_summary(r)
        day_buckets[rd]["pass_steps"] += p
        day_buckets[rd]["fail_steps"] += f

    trend: List[Dict[str, Any]] = []
    for i in range(7):
        d = start_d + timedelta(days=i)
        b = day_buckets[d]
        ps = b["pass_steps"]
        fs = b["fail_steps"]
        day_total = ps + fs
        day_rate = round(100.0 * ps / day_total, 2) if day_total > 0 else None
        trend.append(
            {
                "date": d.strftime("%m-%d"),
                "weekday": weekdays_cn[d.weekday()],
                "report_count": b["report_count"],
                "pass_steps": ps,
                "fail_steps": fs,
                "day_success_rate": day_rate,
            }
        )

    data = {
        "interface_count": interface_count,
        "test_case_count": test_case_count,
        "scenario_count": scenario_count,
        "report_count": len(all_reports),
        "execution_pass_steps": total_pass_steps,
        "execution_fail_steps": total_fail_steps,
        "execution_success_rate": execution_success_rate,
        "scenarios_running": scenarios_running,
        "scenarios_failed": scenarios_failed,
        "trend_7d": trend,
    }
    return {"code": 200, "data": data, "msg": "success"}
