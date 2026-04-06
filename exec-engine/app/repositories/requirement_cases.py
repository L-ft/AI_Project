from __future__ import annotations

from typing import Dict, List, Optional, Sequence

from sqlalchemy import func

from .api_mgmt import BaseRepository
from ..models.api_mgmt import RequirementGroup, TestCase


class RequirementGroupRepository(BaseRepository):
    def list_all(self) -> List[RequirementGroup]:
        return (
            self.db.query(RequirementGroup)
            .order_by(RequirementGroup.upload_time.desc())
            .all()
        )

    def get_by_id(self, group_id: int) -> Optional[RequirementGroup]:
        return (
            self.db.query(RequirementGroup)
            .filter(RequirementGroup.id == group_id)
            .first()
        )

    def get_by_ref(self, group_ref: object) -> Optional[RequirementGroup]:
        return self._get_by_ref(RequirementGroup, group_ref)

    def find_by_file_hash(self, file_hash: str) -> List[RequirementGroup]:
        return (
            self.db.query(RequirementGroup)
            .filter(RequirementGroup.file_hash == file_hash)
            .order_by(RequirementGroup.version.desc())
            .all()
        )

    def get_max_version(self, file_hash: str) -> int:
        return (
            self.db.query(func.max(RequirementGroup.version))
            .filter(RequirementGroup.file_hash == file_hash)
            .scalar()
        ) or 0

    def count_case_map(self, group_ids: Sequence[int]) -> Dict[int, int]:
        ids = [group_id for group_id in group_ids if group_id is not None]
        if not ids:
            return {}

        rows = (
            self.db.query(TestCase.requirement_group_id, func.count(TestCase.id))
            .filter(TestCase.requirement_group_id.in_(ids))
            .group_by(TestCase.requirement_group_id)
            .all()
        )
        return {
            int(group_id): int(case_count)
            for group_id, case_count in rows
            if group_id is not None
        }


class RequirementCaseRepository(BaseRepository):
    def list_by_group(self, group_id: int) -> List[TestCase]:
        return (
            self.db.query(TestCase)
            .filter(TestCase.requirement_group_id == group_id)
            .order_by(TestCase.id.asc())
            .all()
        )

    def delete_by_group(self, group_id: int) -> None:
        (
            self.db.query(TestCase)
            .filter(TestCase.requirement_group_id == group_id)
            .delete(synchronize_session=False)
        )
