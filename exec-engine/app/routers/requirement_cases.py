"""
需求文档上传 → 异步任务生成关键点与测试用例（供前端轮询）。
"""
from __future__ import annotations

import asyncio
import uuid
from typing import Any, Dict

from fastapi import APIRouter, File, HTTPException, UploadFile

from ..ai.llm_service import generate_requirement_test_plan

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
    }


async def _read_text_file(file: UploadFile) -> str:
    name = (file.filename or "").lower()
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="文件为空")
    if name.endswith((".md", ".txt", ".markdown")):
        return raw.decode("utf-8", errors="replace")
    raise HTTPException(
        status_code=415,
        detail="当前仅支持 .md / .txt 文本文件（演示阶段）；请将 Word/PDF 另存为文本后再上传",
    )


async def _process_job(task_id: str, text: str) -> None:
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

        job["phase"] = "done"
        job["progress"] = 100
        job["logs"].append("生成完成")
    except Exception as e:
        job["phase"] = "failed"
        job["errorMessage"] = str(e)
        job["logs"].append(f"失败：{e}")


@router.post("/jobs")
async def create_job(file: UploadFile = File(...)):
    text = await _read_text_file(file)
    task_id = str(uuid.uuid4())
    JOBS[task_id] = _new_job_py()
    asyncio.create_task(_process_job(task_id, text))
    return {"code": 200, "data": {"taskId": task_id}, "msg": "已创建任务"}


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
        },
        "msg": "success",
    }
