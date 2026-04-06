from __future__ import annotations

import asyncio
import hashlib
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import HTTPException, UploadFile

from ..ai.llm_service import generate_requirement_test_plan
from ..database import SessionLocal
from ..models.api_mgmt import RequirementGroup, RequirementGroupStatus, TestCase
from ..repositories.requirement_cases import (
    RequirementCaseRepository,
    RequirementGroupRepository,
)


REQUIREMENT_JOBS: Dict[str, Dict[str, Any]] = {}


class RequirementJobConflict(Exception):
    def __init__(self, payload: Dict[str, Any]):
        super().__init__("Requirement document already exists")
        self.payload = payload


def _new_job_state() -> Dict[str, Any]:
    return {
        "phase": "pending",
        "progress": 0,
        "logs": [],
        "keyPoints": [],
        "cases": [],
        "errorMessage": None,
        "groupId": None,
        "groupCode": None,
    }


class RequirementCaseService:
    def __init__(
        self,
        group_repository: RequirementGroupRepository,
        case_repository: RequirementCaseRepository,
    ):
        self.group_repository = group_repository
        self.case_repository = case_repository

    @staticmethod
    def _doc_title_from_filename(filename: str) -> str:
        stem = Path(filename or "").stem.strip()
        return stem or "Untitled document"

    @staticmethod
    def _serialize_group(group: RequirementGroup, case_count: int = 0) -> Dict[str, Any]:
        status = group.status.value if hasattr(group.status, "value") else str(group.status)
        return {
            "id": group.code,
            "code": group.code,
            "docTitle": group.doc_title,
            "uploadTime": group.upload_time.isoformat() if group.upload_time else None,
            "status": status,
            "fileHash": group.file_hash,
            "version": group.version,
            "caseCount": case_count,
        }

    @staticmethod
    def _case_to_api(test_case: TestCase, requirement_group_code: Optional[str]) -> Dict[str, Any]:
        body = test_case.body_definition if isinstance(test_case.body_definition, dict) else {}
        return {
            "id": test_case.code,
            "code": test_case.code,
            "name": test_case.name,
            "caseType": test_case.case_type,
            "case_type": test_case.case_type,
            "requirementGroupId": requirement_group_code,
            "requirement_group_id": requirement_group_code,
            "title": test_case.name,
            "priority": body.get("priority"),
            "kind": body.get("kind"),
            "steps": body.get("steps") or [],
            "sourceKeyPointId": body.get("sourceKeyPointId"),
            "externalId": body.get("external_id"),
        }

    def _get_group_or_404(self, group_id: object) -> RequirementGroup:
        group = self.group_repository.get_by_ref(group_id)
        if not group:
            raise HTTPException(status_code=404, detail="Requirement group not found")
        return group

    async def _read_text_file(self, file: UploadFile) -> tuple[bytes, str]:
        raw = await file.read()
        if not raw:
            raise HTTPException(status_code=400, detail="Uploaded file is empty")

        filename = (file.filename or "").lower()
        if filename.endswith((".md", ".txt", ".markdown")):
            return raw, raw.decode("utf-8", errors="replace")

        raise HTTPException(
            status_code=415,
            detail="Only .md and .txt files are supported for requirement generation",
        )

    def list_groups(self) -> List[Dict[str, Any]]:
        groups = self.group_repository.list_all()
        counts = self.group_repository.count_case_map([group.id for group in groups])
        return [self._serialize_group(group, counts.get(group.id, 0)) for group in groups]

    def delete_group(self, group_id: object) -> None:
        group = self._get_group_or_404(group_id)
        self.group_repository.delete(group)

    def list_group_cases(self, group_id: object) -> Dict[str, Any]:
        group = self._get_group_or_404(group_id)
        cases = self.case_repository.list_by_group(group.id)
        status = group.status.value if hasattr(group.status, "value") else str(group.status)
        return {
            "group": {
                "id": group.code,
                "code": group.code,
                "docTitle": group.doc_title,
                "uploadTime": group.upload_time.isoformat() if group.upload_time else None,
                "status": status,
                "fileHash": group.file_hash,
                "version": group.version,
                "keyPoints": group.key_points or [],
            },
            "cases": [self._case_to_api(case, group.code) for case in cases],
        }

    async def create_job(
        self,
        file: UploadFile,
        duplicate_action: Optional[str] = None,
        overwrite_group_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        raw, text = await self._read_text_file(file)
        file_hash = hashlib.sha256(raw).hexdigest()
        doc_title = self._doc_title_from_filename(file.filename or "")

        normalized_action = (duplicate_action or "").strip().lower() or None
        if normalized_action and normalized_action not in ("overwrite", "new_version"):
            raise HTTPException(status_code=400, detail="duplicate_action must be overwrite or new_version")

        existing_groups = self.group_repository.find_by_file_hash(file_hash)
        if existing_groups and not normalized_action:
            raise RequirementJobConflict(
                {
                    "conflict": True,
                    "fileHash": file_hash,
                    "groups": [self._serialize_group(group) for group in existing_groups],
                }
            )

        target_group: Optional[RequirementGroup] = None

        try:
            if not existing_groups:
                target_group = RequirementGroup(
                    doc_title=doc_title,
                    upload_time=datetime.utcnow(),
                    status=RequirementGroupStatus.GENERATING,
                    file_hash=file_hash,
                    version=1,
                    key_points=None,
                )
                self.group_repository.add(target_group)
                self.group_repository.flush()
            elif normalized_action == "new_version":
                target_group = RequirementGroup(
                    doc_title=doc_title,
                    upload_time=datetime.utcnow(),
                    status=RequirementGroupStatus.GENERATING,
                    file_hash=file_hash,
                    version=self.group_repository.get_max_version(file_hash) + 1,
                    key_points=None,
                )
                self.group_repository.add(target_group)
                self.group_repository.flush()
            else:
                if overwrite_group_id is not None:
                    target_group = self.group_repository.get_by_ref(overwrite_group_id)
                    if not target_group or target_group.file_hash != file_hash:
                        raise HTTPException(
                            status_code=400,
                            detail="overwrite_group_id does not match the uploaded document",
                        )
                else:
                    target_group = existing_groups[0]

                self.case_repository.delete_by_group(target_group.id)
                target_group.doc_title = doc_title
                target_group.status = RequirementGroupStatus.GENERATING
                target_group.key_points = None

            assert target_group is not None
            self.group_repository.commit()
        except Exception:
            self.group_repository.rollback()
            raise

        task_id = str(uuid.uuid4())
        job = _new_job_state()
        job["groupId"] = target_group.code
        job["groupCode"] = target_group.code
        REQUIREMENT_JOBS[task_id] = job
        asyncio.create_task(self._process_job(task_id, text, target_group.id))

        return {
            "taskId": task_id,
            "groupId": target_group.code,
            "groupCode": target_group.code,
            "fileHash": file_hash,
        }

    def get_job(self, task_id: str) -> Dict[str, Any]:
        job = REQUIREMENT_JOBS.get(task_id)
        if not job:
            raise HTTPException(status_code=404, detail="Requirement generation job not found")
        return {
            "phase": job["phase"],
            "progress": job["progress"],
            "logs": job["logs"],
            "keyPoints": job.get("keyPoints") or [],
            "cases": job.get("cases") or [],
            "errorMessage": job.get("errorMessage"),
            "groupId": job.get("groupId"),
            "groupCode": job.get("groupCode"),
        }

    async def _process_job(self, task_id: str, text: str, group_id: int) -> None:
        job = REQUIREMENT_JOBS.get(task_id)
        if not job:
            return

        try:
            job["phase"] = "parsing"
            job["progress"] = 15
            job["logs"].append("Parsing requirement document")
            await asyncio.sleep(0.35)

            job["progress"] = 35
            job["logs"].append("Extracting requirement key points")
            await asyncio.sleep(0.25)

            job["phase"] = "generating"
            job["progress"] = 50
            job["logs"].append("Generating requirement test cases")

            result = await generate_requirement_test_plan(text)
            job["keyPoints"] = result.get("keyPoints") or []
            job["cases"] = result.get("cases") or []

            job["progress"] = 92
            job["logs"].append("Persisting generated test cases")
            await asyncio.sleep(0.2)

            self._persist_generation_result(group_id, job["keyPoints"], job["cases"])

            job["phase"] = "done"
            job["progress"] = 100
            job["logs"].append("Generation completed")
        except Exception as exc:
            job["phase"] = "failed"
            job["errorMessage"] = str(exc)
            job["logs"].append(f"Failed: {exc}")
            self._mark_group_failed(group_id)

    def _persist_generation_result(
        self,
        group_id: int,
        key_points: List[Any],
        cases: List[Any],
    ) -> None:
        db = SessionLocal()
        group_repository = RequirementGroupRepository(db)
        case_repository = RequirementCaseRepository(db)
        try:
            group = group_repository.get_by_id(group_id)
            if not group:
                return

            group.key_points = key_points
            group.status = RequirementGroupStatus.DONE
            case_repository.delete_by_group(group_id)

            entities: List[TestCase] = []
            for case in cases:
                if not isinstance(case, dict):
                    continue
                entities.append(
                    TestCase(
                        requirement_group_id=group_id,
                        interface_id=None,
                        name=(case.get("title") or "Generated requirement case")[:255],
                        case_type="requirement",
                        body_definition={
                            "external_id": case.get("id"),
                            "priority": case.get("priority"),
                            "kind": case.get("kind"),
                            "steps": case.get("steps") or [],
                            "sourceKeyPointId": case.get("sourceKeyPointId"),
                        },
                        assertions=None,
                        post_operations=None,
                    )
                )

            if entities:
                case_repository.add_all(entities)
            group_repository.commit()
        except Exception:
            group_repository.rollback()
            failed_group = group_repository.get_by_id(group_id)
            if failed_group:
                failed_group.status = RequirementGroupStatus.FAILED
                group_repository.commit()
            raise
        finally:
            db.close()

    def _mark_group_failed(self, group_id: int) -> None:
        db = SessionLocal()
        group_repository = RequirementGroupRepository(db)
        try:
            group = group_repository.get_by_id(group_id)
            if group:
                group.status = RequirementGroupStatus.FAILED
                group_repository.commit()
        finally:
            db.close()
