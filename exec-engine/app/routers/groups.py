"""
需求文档分组：侧边栏列表与某文档下全部用例。
"""
from __future__ import annotations

from typing import Any, Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from ..models.api_mgmt import RequirementGroup, TestCase

router = APIRouter(prefix="/groups", tags=["Requirement Groups"])


def _group_brief(g: RequirementGroup, case_count: int) -> Dict[str, Any]:
    st = g.status
    status_val = st.value if hasattr(st, "value") else str(st)
    return {
        "id": g.id,
        "docTitle": g.doc_title,
        "uploadTime": g.upload_time.isoformat() if g.upload_time else None,
        "status": status_val,
        "fileHash": g.file_hash,
        "version": g.version,
        "caseCount": case_count,
    }


def _case_to_api(tc: TestCase) -> Dict[str, Any]:
    body = tc.body_definition if isinstance(tc.body_definition, dict) else {}
    return {
        "id": tc.id,
        "name": tc.name,
        "caseType": tc.case_type,
        "requirementGroupId": tc.requirement_group_id,
        "title": tc.name,
        "priority": body.get("priority"),
        "kind": body.get("kind"),
        "steps": body.get("steps") or [],
        "sourceKeyPointId": body.get("sourceKeyPointId"),
        "externalId": body.get("external_id"),
    }


@router.get("")
def list_groups(db: Session = Depends(get_db)):
    """返回所有需求文档分组（含生成中/失败），供侧边栏渲染。"""
    rows: List[RequirementGroup] = (
        db.query(RequirementGroup).order_by(RequirementGroup.upload_time.desc()).all()
    )
    counts: Dict[int, int] = {}
    if rows:
        ids = [g.id for g in rows]
        q = (
            db.query(TestCase.requirement_group_id, func.count(TestCase.id))
            .filter(TestCase.requirement_group_id.in_(ids))
            .group_by(TestCase.requirement_group_id)
        )
        for gid, cnt in q.all():
            if gid is not None:
                counts[int(gid)] = int(cnt)
    return {
        "code": 200,
        "data": [_group_brief(g, counts.get(g.id, 0)) for g in rows],
        "msg": "success",
    }


@router.delete("/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db)):
    """删除该需求文档分组及其下全部用例（级联）。"""
    g = db.query(RequirementGroup).filter(RequirementGroup.id == group_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="分组不存在")
    db.delete(g)
    db.commit()
    return {"code": 200, "data": {"id": group_id}, "msg": "已删除"}


@router.get("/{group_id}/cases")
def list_cases_for_group(group_id: int, db: Session = Depends(get_db)):
    """获取某需求文档下的全部已落库测试用例。"""
    g = db.query(RequirementGroup).filter(RequirementGroup.id == group_id).first()
    if not g:
        raise HTTPException(status_code=404, detail="分组不存在")

    cases: List[TestCase] = (
        db.query(TestCase)
        .filter(TestCase.requirement_group_id == group_id)
        .order_by(TestCase.id.asc())
        .all()
    )
    st = g.status
    status_val = st.value if hasattr(st, "value") else str(st)
    return {
        "code": 200,
        "data": {
            "group": {
                "id": g.id,
                "docTitle": g.doc_title,
                "uploadTime": g.upload_time.isoformat() if g.upload_time else None,
                "status": status_val,
                "fileHash": g.file_hash,
                "version": g.version,
                "keyPoints": g.key_points or [],
            },
            "cases": [_case_to_api(c) for c in cases],
        },
        "msg": "success",
    }
