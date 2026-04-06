from __future__ import annotations

from fastapi import Depends
from sqlalchemy.orm import Session

from .database import get_db
from .repositories.api_mgmt import (
    EnvironmentRepository,
    FolderRepository,
    InterfaceRepository,
    ReportRepository,
    ScenarioRepository,
    TestCaseRepository,
)
from .repositories.functional_cases import FunctionalTestCaseRepository
from .repositories.requirement_cases import RequirementCaseRepository, RequirementGroupRepository
from .services.api_mgmt import (
    DashboardService,
    EnvironmentService,
    ExecutorService,
    FolderService,
    InterfaceService,
    ScenarioService,
    TestCaseService,
)
from .services.debug import DebugService
from .services.functional_cases import FunctionalTestCaseService
from .services.requirement_cases import RequirementCaseService


def get_folder_service(db: Session = Depends(get_db)) -> FolderService:
    return FolderService(FolderRepository(db))


def get_interface_service(db: Session = Depends(get_db)) -> InterfaceService:
    return InterfaceService(InterfaceRepository(db), FolderRepository(db))


def get_environment_service(db: Session = Depends(get_db)) -> EnvironmentService:
    return EnvironmentService(EnvironmentRepository(db))


def get_test_case_service(db: Session = Depends(get_db)) -> TestCaseService:
    return TestCaseService(TestCaseRepository(db), InterfaceRepository(db))


def get_executor_service(db: Session = Depends(get_db)) -> ExecutorService:
    return ExecutorService(
        InterfaceRepository(db),
        TestCaseRepository(db),
        EnvironmentRepository(db),
    )


def get_scenario_service(db: Session = Depends(get_db)) -> ScenarioService:
    return ScenarioService(
        ScenarioRepository(db),
        ReportRepository(db),
        EnvironmentRepository(db),
    )


def get_dashboard_service(db: Session = Depends(get_db)) -> DashboardService:
    return DashboardService(
        InterfaceRepository(db),
        TestCaseRepository(db),
        ScenarioRepository(db),
        ReportRepository(db),
    )


def get_debug_service() -> DebugService:
    return DebugService()


def get_functional_test_case_service(
    db: Session = Depends(get_db),
) -> FunctionalTestCaseService:
    return FunctionalTestCaseService(FunctionalTestCaseRepository(db))


def get_requirement_case_service(
    db: Session = Depends(get_db),
) -> RequirementCaseService:
    return RequirementCaseService(
        RequirementGroupRepository(db),
        RequirementCaseRepository(db),
    )
