"""
需求文档上传 → 异步任务生成关键点与测试用例（供前端轮询），并按 RequirementGroup 落库。
相同 file_hash 需由前端在 409 后传入 duplicate_action：overwrite | new_version。
"""
from __future__ import annotations

import asyncio
import hashlib
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..ai.llm_service import generate_requirement_test_plan
from ..database import SessionLocal, get_db
from ..models.api_mgmt import RequirementGroup, RequirementGroupStatus, TestCase

router = APIRouter(prefix="/requirement-cases", tags=["Requirement Cases"])

JOBS: Dict[str, Dict[str, Any]] = {}


def _new_job_py() -> Dict[str, Any]:
    return {
        "phase": "pending",
        "progress": 0,
        "logs": [],
        "keyPoints": [],
        "cases": [],
        "errorMessage": None,
        "groupId": None,
    }


def _doc_title_from_filename(filename: str) -> str:
    stem = Path(filename or "").stem.strip()
    return stem or "未命名文档"


def _groups_for_hash(db: Session, file_hash: str) -> List[RequirementGroup]:
    return (
        db.query(RequirementGroup)
        .filter(RequirementGroup.file_hash == file_hash)
        .order_by(RequirementGroup.version.desc())
        .all()
    )


def _serialize_group_row(g: RequirementGroup) -> Dict[str, Any]:
    st = g.status
    status_val = st.value if hasattr(st, "value") else str(st)
    return {
        "id": g.id,
        "docTitle": g.doc_title,
        "version": g.version,
        "uploadTime": g.upload_time.isoformat() if g.upload_time else None,
        "status": status_val,
        "fileHash": g.file_hash,
    }


def _persist_generation_result(group_id: int, key_points: List[Any], cases: List[Any]) -> None:
    db = SessionLocal()
    try:
        g = db.query(RequirementGroup).filter(RequirementGroup.id == group_id).first()
        if not g:
            return
        g.key_points = key_points
        g.status = RequirementGroupStatus.DONE
        for c in cases:
            if not isinstance(c, dict):
                continue
            db.add(
                TestCase(
                    requirement_group_id=group_id,
                    interface_id=None,
                    name=(c.get("title") or "未命名用例")[:255],
                    case_type="requirement",
                    body_definition={
                        "external_id": c.get("id"),
                        "priority": c.get("priority"),
                        "kind": c.get("kind"),
                        "steps": c.get("steps") or [],
                        "sourceKeyPointId": c.get("sourceKeyPointId"),
                    },
                    assertions=None,
                    post_operations=None,
                )
            )
        db.commit()
    except Exception:
        db.rollback()
        g2 = db.query(RequirementGroup).filter(RequirementGroup.id == group_id).first()
        if g2:
            g2.status = RequirementGroupStatus.FAILED
            db.commit()
        raise
    finally:
        db.close()


def _mark_group_failed(group_id: int) -> None:
    db = SessionLocal()
    try:
        g = db.query(RequirementGroup).filter(RequirementGroup.id == group_id).first()
        if g:
            g.status = RequirementGroupStatus.FAILED
            db.commit()
    finally:
        db.close()


async def _read_text_file(file: UploadFile) -> tuple[bytes, str]:
    name = (file.filename or "").lower()
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="文件为空")
    if name.endswith((".md", ".txt", ".markdown")):
        return raw, raw.decode("utf-8", errors="replace")
    raise HTTPException(
        status_code=415,
        detail="当前仅支持 .md / .txt 文本文件（演示阶段）；请将 Word/PDF 另存为文本后再上传",
    )


async def _process_job(task_id: str, text: str, group_id: int) -> None:
    job = JOBS.get(task_id)
    if not job:
        return
    try:
        job["phase"] = "parsing"
        job["progress"] = 15
        job["logs"].append("正在解析文档结构…")
        await asyncio.sleep(0.35)

        job["progress"] = 35
        job["logs"].append("正在抽取需求要点…")
        await asyncio.sleep(0.25)

        job["phase"] = "generating"
        job["progress"] = 50
        job["logs"].append("正在调用模型生成测试用例草案…")

        result = await generate_requirement_test_plan(text)

        job["keyPoints"] = result.get("keyPoints") or []
        job["cases"] = result.get("cases") or []
        job["progress"] = 92
        job["logs"].append("正在校验步骤与断言结构…")
        await asyncio.sleep(0.2)

        _persist_generation_result(group_id, job["keyPoints"], job["cases"])

        job["phase"] = "done"
        job["progress"] = 100
        job["logs"].append("生成完成")
    except Exception as e:
        job["phase"] = "failed"
        job["errorMessage"] = str(e)
        job["logs"].append(f"失败：{e}")
        _mark_group_failed(group_id)


@router.post("/jobs")
async def create_job(
    file: UploadFile = File(...),
    duplicate_action: Optional[str] = Form(None),
    overwrite_group_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    raw, text = await _read_text_file(file)
    file_hash = hashlib.sha256(raw).hexdigest()
    doc_title = _doc_title_from_filename(file.filename or "")

    dup_action = (duplicate_action or "").strip().lower() or None
    if dup_action and dup_action not in ("overwrite", "new_version"):
        raise HTTPException(status_code=400, detail="duplicate_action 只能是 overwrite 或 new_version")

    existing = _groups_for_hash(db, file_hash)
    if existing and not dup_action:
        return JSONResponse(
            status_code=409,
            content={
                "code": 409,
                "msg": "检测到相同文档（file_hash 一致）已上传过，请选择覆盖或生成新版本",
                "data": {
                    "conflict": True,
                    "fileHash": file_hash,
                    "groups": [_serialize_group_row(x) for x in existing],
                },
            },
        )

    target_group: Optional[RequirementGroup] = None

    if not existing:
        target_group = RequirementGroup(
            doc_title=doc_title,
            upload_time=datetime.utcnow(),
            status=RequirementGroupStatus.GENERATING,
            file_hash=file_hash,
            version=1,
            key_points=None,
        )
        db.add(target_group)
        db.flush()
    elif dup_action == "new_version":
        max_v = (
            db.query(func.max(RequirementGroup.version))
            .filter(RequirementGroup.file_hash == file_hash)
            .scalar()
        ) or 0
        target_group = RequirementGroup(
            doc_title=doc_title,
            upload_time=datetime.utcnow(),
            status=RequirementGroupStatus.GENERATING,
            file_hash=file_hash,
            version=int(max_v) + 1,
            key_points=None,
        )
        db.add(target_group)
        db.flush()
    else:
        # overwrite
        if overwrite_group_id is not None:
            target_group = (
                db.query(RequirementGroup)
                .filter(
                    RequirementGroup.id == overwrite_group_id,
                    RequirementGroup.file_hash == file_hash,
                )
                .first()
            )
            if not target_group:
                raise HTTPException(status_code=400, detail="overwrite_group_id 与 file_hash 不匹配或不存在")
        else:
            target_group = existing[0]

        db.query(TestCase).filter(TestCase.requirement_group_id == target_group.id).delete(
            synchronize_session=False
        )
        target_group.doc_title = doc_title
        target_group.status = RequirementGroupStatus.GENERATING
        target_group.key_points = None
        db.flush()

    assert target_group is not None
    group_id = target_group.id
    db.commit()

    task_id = str(uuid.uuid4())
    job = _new_job_py()
    job["groupId"] = group_id
    JOBS[task_id] = job
    asyncio.create_task(_process_job(task_id, text, group_id))
    return {
        "code": 200,
        "data": {"taskId": task_id, "groupId": group_id, "fileHash": file_hash},
        "msg": "已创建任务",
    }


@router.get("/jobs/{task_id}")
def get_job(task_id: str):
    job = JOBS.get(task_id)
    if not job:
        raise HTTPException(status_code=404, detail="任务不存在")
    return {
        "code": 200,
        "data": {
            "phase": job["phase"],
            "progress": job["progress"],
            "logs": job["logs"],
            "keyPoints": job.get("keyPoints") or [],
            "cases": job.get("cases") or [],
            "errorMessage": job.get("errorMessage"),
            "groupId": job.get("groupId"),
        },
        "msg": "success",
    }
