from __future__ import annotations

from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple

from sqlalchemy import String, cast, func, or_
from sqlalchemy.orm import Session

from ..core.resource_codes import normalize_external_ref
from ..models.api_mgmt import (
    Environment,
    Folder,
    Interface,
    RequirementGroup,
    ScenarioTestReport,
    TestCase,
    TestScenario,
)


class BaseRepository:
    def __init__(self, db: Session):
        self.db = db

    def add(self, entity: Any):
        self.db.add(entity)
        return entity

    def add_all(self, entities: Iterable[Any]) -> None:
        self.db.add_all(list(entities))

    def flush(self) -> None:
        self.db.flush()

    def commit(self) -> None:
        self.db.commit()

    def rollback(self) -> None:
        self.db.rollback()

    def refresh(self, entity: Any):
        self.db.refresh(entity)
        return entity

    def save(self, entity: Any):
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, entity: Any) -> None:
        self.db.delete(entity)
        self.db.commit()

    def _get_by_ref(self, model, raw_ref: object):
        ref = normalize_external_ref(raw_ref)
        if ref is None:
            return None

        row = self.db.query(model).filter(model.code == ref).first()
        if row is not None or not ref.isdigit():
            return row
        return self.db.query(model).filter(model.id == int(ref)).first()

    def resolve_id(self, model, raw_ref: object) -> Optional[int]:
        row = self._get_by_ref(model, raw_ref)
        return row.id if row is not None else None


class FolderRepository(BaseRepository):
    def list_all(self) -> List[Folder]:
        return self.db.query(Folder).order_by(Folder.sort.asc(), Folder.id.asc()).all()

    def get_by_id(self, folder_id: int) -> Optional[Folder]:
        return self.db.query(Folder).filter(Folder.id == folder_id).first()

    def get_by_ref(self, folder_ref: object) -> Optional[Folder]:
        return self._get_by_ref(Folder, folder_ref)


class InterfaceRepository(BaseRepository):
    def list_all(self, folder_id: Optional[int] = None) -> List[Interface]:
        query = self.db.query(Interface)
        if folder_id is not None:
            query = query.filter(Interface.folder_id == folder_id)
        return query.all()

    def get_by_id(self, interface_id: int) -> Optional[Interface]:
        return self.db.query(Interface).filter(Interface.id == interface_id).first()

    def get_by_ref(self, interface_ref: object) -> Optional[Interface]:
        return self._get_by_ref(Interface, interface_ref)


class EnvironmentRepository(BaseRepository):
    def list_all(self) -> List[Environment]:
        return self.db.query(Environment).order_by(Environment.id.asc()).all()

    def get_by_id(self, env_id: int) -> Optional[Environment]:
        return self.db.query(Environment).filter(Environment.id == env_id).first()

    def get_by_ref(self, env_ref: object) -> Optional[Environment]:
        return self._get_by_ref(Environment, env_ref)

    def get_name_map(self, env_ids: Iterable[int]) -> Dict[int, str]:
        ids = [env_id for env_id in set(env_ids) if env_id is not None]
        if not ids:
            return {}
        rows = (
            self.db.query(Environment.id, Environment.name)
            .filter(Environment.id.in_(ids))
            .all()
        )
        return {env_id: name for env_id, name in rows}


class TestCaseRepository(BaseRepository):
    def count_all(self) -> int:
        return self.db.query(TestCase).count()

    def list_all(
        self,
        interface_id: Optional[int] = None,
        case_type: Optional[str] = None,
        exclude_case_type: Optional[str] = None,
        requirement_group_id: Optional[int] = None,
    ) -> List[TestCase]:
        query = self.db.query(TestCase)
        if requirement_group_id is not None:
            query = query.filter(TestCase.requirement_group_id == requirement_group_id)
        else:
            query = query.filter(TestCase.requirement_group_id.is_(None))
        if interface_id is not None:
            query = query.filter(TestCase.interface_id == interface_id)
        if case_type:
            query = query.filter(TestCase.case_type == case_type)
        if exclude_case_type:
            query = query.filter(TestCase.case_type != exclude_case_type)
        return query.all()

    def list_requirement_generated(
        self, keyword: Optional[str] = None, doc_keyword: Optional[str] = None
    ) -> List[Tuple[TestCase, RequirementGroup]]:
        query = (
            self.db.query(TestCase, RequirementGroup)
            .join(RequirementGroup, TestCase.requirement_group_id == RequirementGroup.id)
            .order_by(RequirementGroup.upload_time.desc(), TestCase.id.asc())
        )
        if keyword and keyword.strip():
            query = query.filter(TestCase.name.like(f"%{keyword.strip()}%"))
        if doc_keyword and doc_keyword.strip():
            query = query.filter(RequirementGroup.doc_title.like(f"%{doc_keyword.strip()}%"))
        return query.all()

    def get_by_id(self, case_id: int) -> Optional[TestCase]:
        return self.db.query(TestCase).filter(TestCase.id == case_id).first()

    def get_by_ref(self, case_ref: object) -> Optional[TestCase]:
        return self._get_by_ref(TestCase, case_ref)


class ScenarioRepository(BaseRepository):
    def list_all(self) -> List[TestScenario]:
        return self.db.query(TestScenario).order_by(TestScenario.created_at.desc()).all()

    def get_by_id(self, scenario_id: int) -> Optional[TestScenario]:
        return self.db.query(TestScenario).filter(TestScenario.id == scenario_id).first()

    def get_by_ref(self, scenario_ref: object) -> Optional[TestScenario]:
        return self._get_by_ref(TestScenario, scenario_ref)

    def get_name_map(self, scenario_ids: Iterable[int]) -> Dict[int, str]:
        ids = [scenario_id for scenario_id in set(scenario_ids) if scenario_id is not None]
        if not ids:
            return {}
        rows = (
            self.db.query(TestScenario.id, TestScenario.name)
            .filter(TestScenario.id.in_(ids))
            .all()
        )
        return {scenario_id: name for scenario_id, name in rows}

    def latest_reports_for_scenarios(
        self, scenario_ids: Sequence[int]
    ) -> Dict[int, ScenarioTestReport]:
        ids = [scenario_id for scenario_id in scenario_ids if scenario_id is not None]
        if not ids:
            return {}
        subquery = (
            self.db.query(
                ScenarioTestReport.scenario_id,
                func.max(ScenarioTestReport.id).label("max_id"),
            )
            .filter(ScenarioTestReport.scenario_id.in_(ids))
            .group_by(ScenarioTestReport.scenario_id)
            .subquery()
        )
        rows = (
            self.db.query(ScenarioTestReport)
            .join(subquery, ScenarioTestReport.id == subquery.c.max_id)
            .all()
        )
        return {row.scenario_id: row for row in rows}


class ReportRepository(BaseRepository):
    def list_reports(
        self,
        q: Optional[str] = None,
        scenario_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> List[ScenarioTestReport]:
        query = (
            self.db.query(ScenarioTestReport)
            .outerjoin(TestScenario, TestScenario.id == ScenarioTestReport.scenario_id)
            .order_by(ScenarioTestReport.created_at.desc())
        )
        if scenario_id is not None:
            query = query.filter(ScenarioTestReport.scenario_id == scenario_id)
        if q and q.strip():
            like = f"%{q.strip()}%"
            query = query.filter(
                or_(
                    TestScenario.name.like(like),
                    ScenarioTestReport.creator.like(like),
                    ScenarioTestReport.title.like(like),
                    cast(ScenarioTestReport.summary, String).like(like),
                )
            )
        return query.offset(skip).limit(limit).all()

    def list_by_scenario(
        self, scenario_id: int, skip: int = 0, limit: int = 50
    ) -> List[ScenarioTestReport]:
        return (
            self.db.query(ScenarioTestReport)
            .filter(ScenarioTestReport.scenario_id == scenario_id)
            .order_by(ScenarioTestReport.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, report_id: int) -> Optional[ScenarioTestReport]:
        return (
            self.db.query(ScenarioTestReport)
            .filter(ScenarioTestReport.id == report_id)
            .first()
        )

    def get_by_ref(self, report_ref: object) -> Optional[ScenarioTestReport]:
        return self._get_by_ref(ScenarioTestReport, report_ref)

    def list_all(self) -> List[ScenarioTestReport]:
        return self.db.query(ScenarioTestReport).all()
