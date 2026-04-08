from __future__ import annotations

import math
from datetime import datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional

from fastapi import HTTPException

from ..ai.llm_service import generate_test_cases
from ..core.resource_codes import normalize_external_ref
from ..executor.playwright_runner import run_api_test
from ..models.api_mgmt import (
    Environment,
    Folder,
    Interface,
    RequirementGroup,
    ScenarioTestReport,
    TestCase,
    TestScenario,
)
from ..repositories.api_mgmt import (
    EnvironmentRepository,
    FolderRepository,
    InterfaceRepository,
    ReportRepository,
    ScenarioRepository,
    TestCaseRepository,
)


DEFAULT_VALIDATE_POST_OPS = [
    {
        "type": "validate_response",
        "enabled": True,
        "expect_status": 200,
        "check_json_code": True,
    },
]

def _normalize_tree_ref(raw_ref: object) -> Optional[str]:
    ref = normalize_external_ref(raw_ref)
    if ref in (None, "0"):
        return None
    return ref


def _pick_param_value(item: Dict[str, Any]) -> Any:
    if not isinstance(item, dict):
        return None
    if "value" in item and item.get("value") is not None:
        return item.get("value")
    if "example" in item and item.get("example") is not None:
        return item.get("example")
    return None


def _rows_to_name_value_map(rows: Optional[Iterable[Dict[str, Any]]]) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    for row in rows or []:
        if not isinstance(row, dict):
            continue
        name = row.get("name")
        if not name:
            continue
        result[str(name)] = _pick_param_value(row)
    return result


def _format_datetime(value: Any) -> Optional[str]:
    if value is None:
        return None
    if hasattr(value, "strftime"):
        return value.strftime("%Y-%m-%d %H:%M:%S")
    return str(value)


def _build_code_map(db, model, ids: Iterable[Optional[int]]) -> Dict[int, str]:
    normalized_ids = sorted({entity_id for entity_id in ids if entity_id is not None})
    if not normalized_ids:
        return {}
    rows = db.query(model.id, model.code).filter(model.id.in_(normalized_ids)).all()
    return {
        int(row.id): str(row.code)
        for row in rows
        if getattr(row, "code", None)
    }


def _dual_ref_payload(code: Optional[str]) -> Dict[str, Optional[str]]:
    return {"id": code, "code": code}


class FolderService:
    def __init__(self, repository: FolderRepository):
        self.repository = repository

    def _serialize_folder(self, folder: Folder, code_map: Dict[int, str]) -> Dict[str, Any]:
        parent_code = code_map.get(folder.parent_id) if folder.parent_id is not None else None
        return {
            **_dual_ref_payload(folder.code),
            "name": folder.name,
            "parent_id": parent_code,
            "parentCode": parent_code,
            "sort": folder.sort,
            "created_at": _format_datetime(folder.created_at),
            "createdAt": _format_datetime(folder.created_at),
        }

    def _get_folder_entity(self, folder_ref: object) -> Folder:
        folder = self.repository.get_by_ref(folder_ref)
        if not folder:
            raise HTTPException(status_code=404, detail="Folder not found")
        return folder

    def create_folder(self, body) -> Dict[str, Any]:
        parent_ref = _normalize_tree_ref(body.parent_id)
        parent = None
        if parent_ref is not None:
            parent = self.repository.get_by_ref(parent_ref)
            if not parent:
                raise HTTPException(status_code=400, detail="Parent folder not found")
        folder = Folder(name=body.name, parent_id=parent.id if parent else None)
        saved = self.repository.save(folder)
        code_map = {saved.id: saved.code}
        if saved.parent_id is not None and parent is not None:
            code_map[parent.id] = parent.code
        return self._serialize_folder(saved, code_map)

    def list_folders(self) -> List[Dict[str, Any]]:
        folders = self.repository.list_all()
        code_map = {folder.id: folder.code for folder in folders if folder.code}
        return [self._serialize_folder(folder, code_map) for folder in folders]

    def get_folder(self, folder_ref: object) -> Dict[str, Any]:
        folder = self._get_folder_entity(folder_ref)
        code_map = {row.id: row.code for row in self.repository.list_all() if row.code}
        return self._serialize_folder(folder, code_map)

    def update_folder(self, folder_ref: object, body) -> Dict[str, Any]:
        folder = self._get_folder_entity(folder_ref)
        if body.name is not None:
            folder.name = body.name
        if body.parent_id is not None:
            parent_ref = _normalize_tree_ref(body.parent_id)
            parent = None
            if parent_ref is not None:
                parent = self.repository.get_by_ref(parent_ref)
                if not parent:
                    raise HTTPException(status_code=400, detail="Parent folder not found")
                if parent.id == folder.id:
                    raise HTTPException(status_code=400, detail="Folder cannot be its own parent")
            folder.parent_id = parent.id if parent else None
        saved = self.repository.save(folder)
        code_map = {row.id: row.code for row in self.repository.list_all() if row.code}
        return self._serialize_folder(saved, code_map)

    def delete_folder(self, folder_ref: object) -> None:
        folder = self._get_folder_entity(folder_ref)
        self.repository.delete(folder)


class InterfaceService:
    def __init__(self, interface_repository: InterfaceRepository, folder_repository: FolderRepository):
        self.interface_repository = interface_repository
        self.folder_repository = folder_repository

    def _resolve_folder_id(self, folder_ref: object) -> Optional[int]:
        normalized = _normalize_tree_ref(folder_ref)
        if normalized is None:
            return None
        folder = self.folder_repository.get_by_ref(normalized)
        if not folder:
            raise HTTPException(status_code=400, detail="Folder not found")
        return folder.id

    def _folder_code_map(self) -> Dict[int, str]:
        folders = self.folder_repository.list_all()
        return {folder.id: folder.code for folder in folders if folder.code}

    def _serialize_interface(self, interface: Interface, folder_code_map: Dict[int, str]) -> Dict[str, Any]:
        folder_code = folder_code_map.get(interface.folder_id) if interface.folder_id is not None else None
        method_value = interface.method.value if hasattr(interface.method, "value") else interface.method
        status_value = interface.status.value if hasattr(interface.status, "value") else interface.status
        return {
            **_dual_ref_payload(interface.code),
            "name": interface.name,
            "method": method_value,
            "path": interface.path,
            "status": status_value,
            "owner": interface.owner,
            "folder_id": folder_code,
            "folderCode": folder_code,
            "query_params": interface.query_params,
            "queryParams": interface.query_params,
            "header_params": interface.header_params,
            "headerParams": interface.header_params,
            # 与 queryParams 相同：同时给 snake_case / camelCase，便于不同前端约定；值是同一份，不是重复存储
            "body_definition": interface.body_definition,
            "bodyDefinition": interface.body_definition,
            "post_operations": interface.post_operations,
            "postOperations": interface.post_operations,
            "created_at": _format_datetime(interface.created_at),
            "createdAt": _format_datetime(interface.created_at),
            "updated_at": _format_datetime(interface.updated_at),
            "updatedAt": _format_datetime(interface.updated_at),
        }

    def _get_interface_entity(self, interface_ref: object) -> Interface:
        interface = self.interface_repository.get_by_ref(interface_ref)
        if not interface:
            raise HTTPException(status_code=404, detail="Interface not found")
        return interface

    def create_interface(self, body) -> Dict[str, Any]:
        interface = Interface(
            name=body.name,
            method=body.method,
            path=body.path,
            folder_id=self._resolve_folder_id(body.folder_id),
            status=body.status,
            owner=body.owner,
            query_params=body.query_params,
            header_params=body.header_params,
            body_definition=body.body_definition,
            post_operations=body.post_operations,
        )
        saved = self.interface_repository.save(interface)
        return self._serialize_interface(saved, self._folder_code_map())

    def list_interfaces(self, folder_id: object = None) -> List[Dict[str, Any]]:
        resolved_folder_id = self._resolve_folder_id(folder_id) if folder_id is not None else None
        interfaces = self.interface_repository.list_all(resolved_folder_id)
        folder_code_map = self._folder_code_map()
        return [self._serialize_interface(interface, folder_code_map) for interface in interfaces]

    def get_interface(self, interface_ref: object) -> Dict[str, Any]:
        return self._serialize_interface(self._get_interface_entity(interface_ref), self._folder_code_map())

    def update_interface(self, interface_ref: object, body) -> Dict[str, Any]:
        interface = self._get_interface_entity(interface_ref)
        update_data = body.model_dump(exclude_unset=True)
        if "folder_id" in update_data:
            update_data["folder_id"] = self._resolve_folder_id(update_data["folder_id"])
        for key, value in update_data.items():
            setattr(interface, key, value)
        saved = self.interface_repository.save(interface)
        return self._serialize_interface(saved, self._folder_code_map())

    def delete_interface(self, interface_ref: object) -> None:
        interface = self._get_interface_entity(interface_ref)
        self.interface_repository.delete(interface)


class EnvironmentService:
    def __init__(self, repository: EnvironmentRepository):
        self.repository = repository

    def _serialize_environment(self, env: Environment) -> Dict[str, Any]:
        return {
            **_dual_ref_payload(env.code),
            "name": env.name,
            "base_url": env.base_url,
            "baseUrl": env.base_url,
            "urls": env.urls,
            "variables": env.variables,
            "global_config": env.global_config,
            "globalConfig": env.global_config,
            "is_active": env.is_active,
            "isActive": env.is_active,
        }

    def _get_environment_entity(self, env_ref: object) -> Environment:
        env = self.repository.get_by_ref(env_ref)
        if not env:
            raise HTTPException(status_code=404, detail="Environment not found")
        return env

    def create_environment(self, body) -> Dict[str, Any]:
        return self._serialize_environment(self.repository.save(Environment(**body.model_dump())))

    def list_environments(self) -> List[Dict[str, Any]]:
        return [self._serialize_environment(env) for env in self.repository.list_all()]

    def get_environment(self, env_ref: object) -> Dict[str, Any]:
        return self._serialize_environment(self._get_environment_entity(env_ref))

    def update_environment(self, env_ref: object, body) -> Dict[str, Any]:
        env = self._get_environment_entity(env_ref)
        for key, value in body.model_dump(exclude_unset=True).items():
            setattr(env, key, value)
        return self._serialize_environment(self.repository.save(env))

    def delete_environment(self, env_ref: object) -> None:
        env = self._get_environment_entity(env_ref)
        self.repository.delete(env)


class TestCaseService:
    def __init__(self, test_case_repository: TestCaseRepository, interface_repository: InterfaceRepository):
        self.test_case_repository = test_case_repository
        self.interface_repository = interface_repository

    def _resolve_interface_id(self, interface_ref: object) -> Optional[int]:
        ref = normalize_external_ref(interface_ref)
        if ref is None:
            return None
        interface = self.interface_repository.get_by_ref(ref)
        if not interface:
            raise HTTPException(status_code=400, detail="Interface not found")
        return interface.id

    def _resolve_requirement_group_id(self, requirement_group_ref: object) -> Optional[int]:
        ref = normalize_external_ref(requirement_group_ref)
        if ref is None:
            return None
        group = self.test_case_repository._get_by_ref(RequirementGroup, ref)
        if not group:
            raise HTTPException(status_code=400, detail="Requirement group not found")
        return group.id

    def _serialize_test_case(
        self,
        test_case: TestCase,
        interface_code_map: Dict[int, str],
        group_code_map: Dict[int, str],
    ) -> Dict[str, Any]:
        interface_code = interface_code_map.get(test_case.interface_id) if test_case.interface_id is not None else None
        group_code = group_code_map.get(test_case.requirement_group_id) if test_case.requirement_group_id is not None else None
        return {
            **_dual_ref_payload(test_case.code),
            "interface_id": interface_code,
            "interfaceCode": interface_code,
            "requirement_group_id": group_code,
            "requirementGroupCode": group_code,
            "name": test_case.name,
            "case_type": test_case.case_type,
            "caseType": test_case.case_type,
            "query_params": test_case.query_params,
            "queryParams": test_case.query_params,
            "header_params": test_case.header_params,
            "headerParams": test_case.header_params,
            "body_definition": test_case.body_definition,
            "bodyDefinition": test_case.body_definition,
            "assertions": test_case.assertions,
            "pre_operations": test_case.pre_operations,
            "preOperations": test_case.pre_operations,
            "post_operations": test_case.post_operations,
            "postOperations": test_case.post_operations,
            "created_at": _format_datetime(test_case.created_at),
            "createdAt": _format_datetime(test_case.created_at),
            "updated_at": _format_datetime(test_case.updated_at),
            "updatedAt": _format_datetime(test_case.updated_at),
        }

    def _serialize_many(self, test_cases: List[TestCase]) -> List[Dict[str, Any]]:
        interface_code_map = _build_code_map(
            self.test_case_repository.db,
            Interface,
            [test_case.interface_id for test_case in test_cases],
        )
        group_code_map = _build_code_map(
            self.test_case_repository.db,
            RequirementGroup,
            [test_case.requirement_group_id for test_case in test_cases],
        )
        return [
            self._serialize_test_case(test_case, interface_code_map, group_code_map)
            for test_case in test_cases
        ]

    def _get_test_case_entity(self, case_ref: object) -> TestCase:
        test_case = self.test_case_repository.get_by_ref(case_ref)
        if not test_case:
            raise HTTPException(status_code=404, detail="Test case not found")
        return test_case

    async def ai_generate_cases(self, body) -> Dict[str, Any]:
        interface = self.interface_repository.get_by_ref(body.interface_id)
        if not interface:
            raise HTTPException(status_code=404, detail="Interface not found")

        interface_info = {
            "name": interface.name,
            "method": interface.method.value if hasattr(interface.method, "value") else interface.method,
            "path": interface.path,
            "query_params": interface.query_params or [],
            "header_params": interface.header_params or [],
            "body_definition": interface.body_definition or {},
        }
        try:
            cases = await generate_test_cases(interface_info, body.scenarios, body.extra_requirement)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"AI 生成失败: {exc}") from exc

        if body.save:
            for case in cases:
                entity = TestCase(
                    interface_id=interface.id,
                    name=case.get("name", "AI 生成用例"),
                    case_type=case.get("case_type", "positive"),
                    query_params=case.get("query_params"),
                    header_params=case.get("header_params"),
                    body_definition=case.get("body_definition"),
                    assertions=case.get("assertions"),
                    post_operations=list(DEFAULT_VALIDATE_POST_OPS),
                )
                self.test_case_repository.db.add(entity)
            self.test_case_repository.db.commit()
            return {"code": 200, "msg": f"已生成并保存 {len(cases)} 条用例", "data": cases}

        return {"code": 200, "msg": f"已生成 {len(cases)} 条用例（预览，未保存）", "data": cases}

    def create_test_case(self, body) -> Dict[str, Any]:
        entity = TestCase(
            interface_id=self._resolve_interface_id(body.interface_id),
            name=body.name,
            case_type=body.case_type,
            query_params=body.query_params,
            header_params=body.header_params,
            body_definition=body.body_definition,
            assertions=body.assertions,
            pre_operations=getattr(body, "pre_operations", None),
            post_operations=body.post_operations or list(DEFAULT_VALIDATE_POST_OPS),
        )
        return self._serialize_many([self.test_case_repository.save(entity)])[0]

    def list_test_cases(
        self,
        interface_id: object = None,
        case_type: Optional[str] = None,
        exclude_case_type: Optional[str] = None,
        requirement_group_id: object = None,
    ) -> List[Dict[str, Any]]:
        resolved_interface_id = self._resolve_interface_id(interface_id) if interface_id is not None else None
        resolved_group_id = self._resolve_requirement_group_id(requirement_group_id) if requirement_group_id is not None else None
        test_cases = self.test_case_repository.list_all(
            resolved_interface_id,
            case_type,
            exclude_case_type,
            resolved_group_id,
        )
        return self._serialize_many(test_cases)

    def list_requirement_generated_cases(self, keyword: Optional[str] = None, doc_keyword: Optional[str] = None) -> List[Dict[str, Any]]:
        rows = self.test_case_repository.list_requirement_generated(keyword, doc_keyword)
        result: List[Dict[str, Any]] = []
        for test_case, group in rows:
            body = test_case.body_definition if isinstance(test_case.body_definition, dict) else {}
            result.append(
                {
                    **_dual_ref_payload(test_case.code),
                    "requirementGroupId": group.code,
                    "requirement_group_id": group.code,
                    "docTitle": group.doc_title,
                    "groupVersion": group.version,
                    "name": test_case.name,
                    "caseType": test_case.case_type,
                    "case_type": test_case.case_type,
                    "priority": body.get("priority"),
                    "kind": body.get("kind"),
                    "steps": body.get("steps") or [],
                    "sourceKeyPointId": body.get("sourceKeyPointId"),
                    "externalId": body.get("external_id"),
                }
            )
        return result

    def get_test_case(self, case_ref: object) -> Dict[str, Any]:
        return self._serialize_many([self._get_test_case_entity(case_ref)])[0]

    def update_test_case(self, case_ref: object, body) -> Dict[str, Any]:
        test_case = self._get_test_case_entity(case_ref)
        update_data = body.model_dump(exclude_unset=True)
        if "interface_id" in update_data:
            update_data["interface_id"] = self._resolve_interface_id(update_data["interface_id"])
        if "requirement_group_id" in update_data:
            update_data["requirement_group_id"] = self._resolve_requirement_group_id(update_data["requirement_group_id"])
        for key, value in update_data.items():
            setattr(test_case, key, value)
        return self._serialize_many([self.test_case_repository.save(test_case)])[0]

    def delete_test_case(self, case_ref: object) -> None:
        test_case = self._get_test_case_entity(case_ref)
        self.test_case_repository.delete(test_case)


class ExecutorService:
    def __init__(
        self,
        interface_repository: InterfaceRepository,
        test_case_repository: TestCaseRepository,
        environment_repository: EnvironmentRepository,
    ):
        self.interface_repository = interface_repository
        self.test_case_repository = test_case_repository
        self.environment_repository = environment_repository

    async def run_interface(self, interface_id: object, env_id: object = None):
        interface = self.interface_repository.get_by_ref(interface_id)
        if not interface:
            raise HTTPException(status_code=404, detail="Interface not found")
        env_base_url = ""
        if env_id is not None:
            env = self.environment_repository.get_by_ref(env_id)
            if env:
                env_base_url = env.base_url
        api_definition = {
            "name": interface.name,
            "method": interface.method,
            "url": f"{env_base_url}{interface.path}",
            "headers": _rows_to_name_value_map(interface.header_params),
            "params": _rows_to_name_value_map(interface.query_params),
            "body": interface.body_definition,
        }
        return await run_api_test(api_definition)

    async def run_test_case(self, case_id: object, env_id: object = None):
        test_case = self.test_case_repository.get_by_ref(case_id)
        if not test_case:
            raise HTTPException(status_code=404, detail="Test case not found")
        if test_case.interface_id is None or test_case.interface is None:
            raise HTTPException(status_code=400, detail="该用例来自需求文档生成，无关联接口，无法通过执行器按 HTTP 接口运行")
        interface = test_case.interface
        env_base_url = ""
        if env_id is not None:
            env = self.environment_repository.get_by_ref(env_id)
            if env:
                env_base_url = env.base_url

        headers = _rows_to_name_value_map(interface.header_params)
        headers.update(_rows_to_name_value_map(test_case.header_params))
        params = _rows_to_name_value_map(interface.query_params)
        params.update(_rows_to_name_value_map(test_case.query_params))
        body = test_case.body_definition if test_case.body_definition else interface.body_definition

        api_definition = {
            "name": f"{interface.name} - {test_case.name}",
            "method": interface.method,
            "url": f"{env_base_url}{interface.path}",
            "headers": headers,
            "params": params,
            "body": body,
            "assertions": test_case.assertions,
        }
        return await run_api_test(api_definition)


class ScenarioService:
    def __init__(
        self,
        scenario_repository: ScenarioRepository,
        report_repository: ReportRepository,
        environment_repository: EnvironmentRepository,
    ):
        self.scenario_repository = scenario_repository
        self.report_repository = report_repository
        self.environment_repository = environment_repository

    def _get_interface_by_ref(self, interface_ref: object) -> Optional[Interface]:
        ref = normalize_external_ref(interface_ref)
        if ref is None:
            return None
        return self.scenario_repository._get_by_ref(Interface, ref)

    def _get_test_case_by_ref(self, case_ref: object) -> Optional[TestCase]:
        ref = normalize_external_ref(case_ref)
        if ref is None:
            return None
        return self.scenario_repository._get_by_ref(TestCase, ref)

    def _resolve_env_id(self, env_ref: object) -> Optional[int]:
        ref = normalize_external_ref(env_ref)
        if ref is None:
            return None
        env = self.environment_repository.get_by_ref(ref)
        if not env:
            raise HTTPException(status_code=400, detail="Environment not found")
        return env.id

    def _serialize_steps(self, steps: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        normalized_steps: List[Dict[str, Any]] = []
        for raw_step in steps or []:
            if not isinstance(raw_step, dict):
                continue
            step = dict(raw_step)
            interface_code = normalize_external_ref(
                step.get("interfaceCode") or step.get("interface_id") or step.get("interfaceId")
            )
            case_code = normalize_external_ref(
                step.get("caseCode") or step.get("case_id") or step.get("caseId")
            )
            step["interface_id"] = interface_code
            step["interfaceCode"] = interface_code
            step["case_id"] = case_code
            step["caseCode"] = case_code
            normalized_steps.append(step)
        return normalized_steps

    def _normalize_steps_for_storage(self, steps: Optional[List[Dict[str, Any]]]) -> List[Dict[str, Any]]:
        normalized_steps: List[Dict[str, Any]] = []
        for raw_step in steps or []:
            if not isinstance(raw_step, dict):
                continue
            step = dict(raw_step)

            case = self._get_test_case_by_ref(step.get("caseCode") or step.get("case_id") or step.get("caseId"))
            interface = self._get_interface_by_ref(
                step.get("interfaceCode") or step.get("interface_id") or step.get("interfaceId")
            )

            if case and case.interface_id is not None and interface is None:
                interface = self.scenario_repository._get_by_ref(Interface, case.interface_id)

            interface_code = interface.code if interface is not None else normalize_external_ref(
                step.get("interfaceCode") or step.get("interface_id") or step.get("interfaceId")
            )
            case_code = case.code if case is not None else normalize_external_ref(
                step.get("caseCode") or step.get("case_id") or step.get("caseId")
            )

            step["interface_id"] = interface_code
            step["interfaceCode"] = interface_code
            step["case_id"] = case_code
            step["caseCode"] = case_code
            normalized_steps.append(step)

        return normalized_steps

    @staticmethod
    def _derive_status_from_report_summary(summary: Optional[Dict[str, Any]]) -> str:
        summary = summary or {}
        fail_n = int(summary.get("fail") or 0)
        pass_n = int(summary.get("pass") or 0)
        total = fail_n + pass_n
        if total == 0:
            return "unknown"
        return "failed" if fail_n > 0 else "passed"

    def _last_report_public_dict(self, report: ScenarioTestReport) -> Dict[str, Any]:
        summary = report.summary or {}
        return {
            **_dual_ref_payload(report.code),
            "created_at": _format_datetime(report.created_at),
            "createdAt": _format_datetime(report.created_at),
            "trigger_type": report.trigger_type or "manual",
            "triggerType": report.trigger_type or "manual",
            "summary": summary,
            "status": self._derive_status_from_report_summary(summary),
        }

    def _summarize_report_entries(self, entries: List[Dict[str, Any]]) -> Dict[str, Any]:
        total = len(entries)
        pass_n = sum(1 for entry in entries if entry.get("pass") is True)
        fail_n = total - pass_n
        sum_ms = 0.0
        n_ms = 0
        for entry in entries:
            elapsed_ms = entry.get("elapsedMs")
            if elapsed_ms is None:
                continue
            try:
                value = float(elapsed_ms)
            except (TypeError, ValueError):
                continue
            if math.isnan(value):
                continue
            sum_ms += value
            n_ms += 1
        return {
            "total": total,
            "pass": pass_n,
            "fail": fail_n,
            "untested": 0,
            "sum_ms": sum_ms,
            "avg_ms": (sum_ms / n_ms) if n_ms else 0.0,
            "n_ms": n_ms,
        }

    def _build_report_dicts(
        self, rows: List[ScenarioTestReport], include_entries: bool
    ) -> List[Dict[str, Any]]:
        scenario_map = self.scenario_repository.get_name_map([row.scenario_id for row in rows])
        env_map = self.environment_repository.get_name_map(
            [row.env_id for row in rows if row.env_id is not None]
        )
        scenario_code_map = _build_code_map(
            self.report_repository.db,
            TestScenario,
            [row.scenario_id for row in rows],
        )
        env_code_map = _build_code_map(
            self.report_repository.db,
            Environment,
            [row.env_id for row in rows if row.env_id is not None],
        )
        result: List[Dict[str, Any]] = []
        for row in rows:
            scenario_code = scenario_code_map.get(row.scenario_id)
            env_code = env_code_map.get(row.env_id) if row.env_id is not None else None
            payload = {
                **_dual_ref_payload(row.code),
                "scenario_id": scenario_code,
                "scenarioCode": scenario_code,
                "scenario_name": scenario_map.get(row.scenario_id, ""),
                "scenarioName": scenario_map.get(row.scenario_id, ""),
                "env_id": env_code,
                "envCode": env_code,
                "env_name": env_map.get(row.env_id) if row.env_id is not None else None,
                "envName": env_map.get(row.env_id) if row.env_id is not None else None,
                "creator": row.creator or "",
                "trigger_type": row.trigger_type or "manual",
                "triggerType": row.trigger_type or "manual",
                "title": row.title,
                "summary": row.summary or {},
                "created_at": _format_datetime(row.created_at),
                "createdAt": _format_datetime(row.created_at),
            }
            if include_entries:
                payload["entries"] = row.entries or []
            result.append(payload)
        return result

    def _serialize_scenario(
        self,
        scenario: TestScenario,
        env_code_map: Dict[int, str],
        env_name_map: Dict[int, str],
        latest_report: Optional[ScenarioTestReport],
    ) -> Dict[str, Any]:
        env_code = env_code_map.get(scenario.env_id) if scenario.env_id is not None else None
        env_name = env_name_map.get(scenario.env_id) if scenario.env_id is not None else None
        priority_value = scenario.priority.value if hasattr(scenario.priority, "value") else scenario.priority
        last_report = self._last_report_public_dict(latest_report) if latest_report else None
        return {
            **_dual_ref_payload(scenario.code),
            "name": scenario.name,
            "priority": priority_value,
            "tags": scenario.tags,
            "env_id": env_code,
            "envCode": env_code,
            "env_name": env_name,
            "envName": env_name,
            "description": scenario.description,
            "steps": self._serialize_steps(scenario.steps or []),
            "last_result": scenario.last_result,
            "lastResult": scenario.last_result,
            "last_report": last_report,
            "lastReport": last_report,
            "creator": scenario.creator,
            "created_at": _format_datetime(scenario.created_at),
            "createdAt": _format_datetime(scenario.created_at),
            "updated_at": _format_datetime(scenario.updated_at),
            "updatedAt": _format_datetime(scenario.updated_at),
        }

    def _get_scenario_entity(self, scenario_ref: object) -> TestScenario:
        scenario = self.scenario_repository.get_by_ref(scenario_ref)
        if not scenario:
            raise HTTPException(status_code=404, detail="Scenario not found")
        return scenario

    def list_all_reports(
        self,
        q: Optional[str] = None,
        scenario_id: object = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        scenario = self._get_scenario_entity(scenario_id) if scenario_id is not None else None
        rows = self.report_repository.list_reports(
            q=q,
            scenario_id=scenario.id if scenario is not None else None,
            skip=skip,
            limit=limit,
        )
        return self._build_report_dicts(rows, include_entries=False)

    def get_report_detail(self, report_id: object) -> Dict[str, Any]:
        report = self.report_repository.get_by_ref(report_id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        return self._build_report_dicts([report], include_entries=True)[0]

    def list_scenario_reports(self, scenario_id: object, skip: int = 0, limit: int = 50) -> List[Dict[str, Any]]:
        scenario = self._get_scenario_entity(scenario_id)
        rows = self.report_repository.list_by_scenario(scenario.id, skip, limit)
        return self._build_report_dicts(rows, include_entries=False)

    def create_scenario_report(self, scenario_id: object, body) -> Dict[str, Any]:
        scenario = self._get_scenario_entity(scenario_id)
        entries = body.entries or []
        summary = body.summary if body.summary else self._summarize_report_entries(entries)
        if "total" not in summary and entries:
            summary = {**self._summarize_report_entries(entries), **summary}
        report = ScenarioTestReport(
            scenario_id=scenario.id,
            env_id=self._resolve_env_id(body.env_id) if body.env_id is not None else scenario.env_id,
            creator=body.creator or "",
            trigger_type=body.trigger_type or "manual",
            title=body.title,
            summary=summary,
            entries=entries,
        )
        saved = self.report_repository.save(report)
        return {"id": saved.code, "code": saved.code, "summary": saved.summary}

    def list_scenarios(self) -> List[Dict[str, Any]]:
        scenarios = self.scenario_repository.list_all()
        latest_by_id = self.scenario_repository.latest_reports_for_scenarios([scenario.id for scenario in scenarios])
        env_map = self.environment_repository.get_name_map(
            [scenario.env_id for scenario in scenarios if scenario.env_id is not None]
        )
        env_code_map = _build_code_map(
            self.scenario_repository.db,
            Environment,
            [scenario.env_id for scenario in scenarios if scenario.env_id is not None],
        )
        return [
            self._serialize_scenario(scenario, env_code_map, env_map, latest_by_id.get(scenario.id))
            for scenario in scenarios
        ]

    def create_scenario(self, body) -> Dict[str, Any]:
        scenario = TestScenario(
            name=body.name,
            priority=body.priority,
            tags=body.tags,
            env_id=self._resolve_env_id(body.env_id) if body.env_id is not None else None,
            description=body.description,
            steps=self._normalize_steps_for_storage(body.steps or []),
            creator=body.creator or "",
        )
        saved = self.scenario_repository.save(scenario)
        return {"id": saved.code, "code": saved.code}

    def get_scenario(self, scenario_id: object) -> TestScenario:
        return self._get_scenario_entity(scenario_id)

    def get_scenario_detail(self, scenario_id: object) -> Dict[str, Any]:
        scenario = self._get_scenario_entity(scenario_id)
        latest_by_id = self.scenario_repository.latest_reports_for_scenarios([scenario.id])
        env_name_map = self.environment_repository.get_name_map(
            [scenario.env_id] if scenario.env_id is not None else []
        )
        env_code_map = _build_code_map(
            self.scenario_repository.db,
            Environment,
            [scenario.env_id] if scenario.env_id is not None else [],
        )
        return self._serialize_scenario(scenario, env_code_map, env_name_map, latest_by_id.get(scenario.id))

    def update_scenario(self, scenario_id: object, body) -> None:
        scenario = self._get_scenario_entity(scenario_id)
        update_data = body.model_dump(exclude_none=True)
        if "env_id" in update_data:
            update_data["env_id"] = self._resolve_env_id(update_data["env_id"])
        if "steps" in update_data:
            update_data["steps"] = self._normalize_steps_for_storage(update_data["steps"])
        for field, value in update_data.items():
            setattr(scenario, field, value)
        self.scenario_repository.save(scenario)

    def delete_scenario(self, scenario_id: object) -> None:
        scenario = self._get_scenario_entity(scenario_id)
        self.scenario_repository.delete(scenario)

    def run_scenario(self, scenario_id: object) -> Dict[str, Any]:
        scenario = self._get_scenario_entity(scenario_id)
        scenario.last_result = {"status": "running", "passed": 0, "failed": 0, "duration": 0}
        self.scenario_repository.save(scenario)
        return {"status": "running", "scenarioCode": scenario.code}


class DashboardService:
    def __init__(
        self,
        interface_repository: InterfaceRepository,
        test_case_repository: TestCaseRepository,
        scenario_repository: ScenarioRepository,
        report_repository: ReportRepository,
    ):
        self.interface_repository = interface_repository
        self.test_case_repository = test_case_repository
        self.scenario_repository = scenario_repository
        self.report_repository = report_repository

    @staticmethod
    def _report_date(created_at: Any):
        if created_at is None:
            return None
        if hasattr(created_at, "date"):
            return created_at.date()
        return None

    @staticmethod
    def _sum_report_summary(report: ScenarioTestReport) -> tuple[int, int]:
        summary = report.summary or {}
        return int(summary.get("pass") or 0), int(summary.get("fail") or 0)

    def overview(self) -> Dict[str, Any]:
        interface_count = len(self.interface_repository.list_all())
        test_case_count = self.test_case_repository.count_all()
        scenarios = self.scenario_repository.list_all()
        reports = self.report_repository.list_all()

        total_pass_steps = 0
        total_fail_steps = 0
        for report in reports:
            passed, failed = self._sum_report_summary(report)
            total_pass_steps += passed
            total_fail_steps += failed

        denominator = total_pass_steps + total_fail_steps
        execution_success_rate = round(100.0 * total_pass_steps / denominator, 2) if denominator > 0 else None

        scenarios_running = 0
        scenarios_failed = 0
        for scenario in scenarios:
            last_result = scenario.last_result or {}
            status = last_result.get("status")
            if status == "running":
                scenarios_running += 1
            elif status == "failed":
                scenarios_failed += 1

        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=6)
        weekdays_cn = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
        buckets: Dict[Any, Dict[str, int]] = {}
        for index in range(7):
            current = start_date + timedelta(days=index)
            buckets[current] = {"report_count": 0, "pass_steps": 0, "fail_steps": 0}
        for report in reports:
            report_date = self._report_date(report.created_at)
            if report_date is None or report_date < start_date or report_date > end_date:
                continue
            buckets[report_date]["report_count"] += 1
            passed, failed = self._sum_report_summary(report)
            buckets[report_date]["pass_steps"] += passed
            buckets[report_date]["fail_steps"] += failed

        trend: List[Dict[str, Any]] = []
        for index in range(7):
            current = start_date + timedelta(days=index)
            bucket = buckets[current]
            passed = bucket["pass_steps"]
            failed = bucket["fail_steps"]
            total = passed + failed
            trend.append(
                {
                    "date": current.strftime("%m-%d"),
                    "weekday": weekdays_cn[current.weekday()],
                    "report_count": bucket["report_count"],
                    "pass_steps": passed,
                    "fail_steps": failed,
                    "day_success_rate": round(100.0 * passed / total, 2) if total > 0 else None,
                }
            )

        return {
            "interface_count": interface_count,
            "test_case_count": test_case_count,
            "scenario_count": len(scenarios),
            "report_count": len(reports),
            "execution_pass_steps": total_pass_steps,
            "execution_fail_steps": total_fail_steps,
            "execution_success_rate": execution_success_rate,
            "scenarios_running": scenarios_running,
            "scenarios_failed": scenarios_failed,
            "trend_7d": trend,
        }
