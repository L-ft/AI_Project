from __future__ import annotations

from typing import List, Optional, Tuple

from sqlalchemy import or_

from .api_mgmt import BaseRepository
from ..models.api_mgmt import FunctionalTestCase


class FunctionalTestCaseRepository(BaseRepository):
    def list_paginated(
        self,
        page: int,
        page_size: int,
        module: Optional[str] = None,
        keyword: Optional[str] = None,
    ) -> Tuple[List[FunctionalTestCase], int]:
        query = self.db.query(FunctionalTestCase)
        if module:
            query = query.filter(FunctionalTestCase.module.contains(module.strip()))
        if keyword:
            like = f"%{keyword.strip()}%"
            query = query.filter(
                or_(
                    FunctionalTestCase.title.like(like),
                    FunctionalTestCase.case_code.like(like),
                    FunctionalTestCase.remark.like(like),
                )
            )

        total = query.count()
        items = (
            query.order_by(FunctionalTestCase.id.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return items, total

    def get_by_id(self, case_id: int) -> Optional[FunctionalTestCase]:
        return (
            self.db.query(FunctionalTestCase)
            .filter(FunctionalTestCase.id == case_id)
            .first()
        )

    def get_by_ref(self, case_ref: object) -> Optional[FunctionalTestCase]:
        return self._get_by_ref(FunctionalTestCase, case_ref)
