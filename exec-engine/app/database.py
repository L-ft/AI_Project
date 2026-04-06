import os
from typing import Callable, Optional

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, sessionmaker

from .core.resource_codes import build_resource_code, is_valid_resource_code
from .models.api_mgmt import Base
from .models.api_mgmt import (
    Environment,
    Folder,
    FunctionalTestCase,
    Interface,
    RequirementGroup,
    ScenarioTestReport,
    TestCase,
    TestScenario,
)


DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "root_password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "ai_automation_db")

SQLALCHEMY_DATABASE_URL = (
    f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def _ensure_column(conn, table_name: str, column_name: str, ddl: str) -> None:
    try:
        conn.execute(text(f"SELECT {column_name} FROM {table_name} LIMIT 1"))
    except Exception:
        try:
            conn.execute(text(ddl))
            conn.commit()
        except Exception:
            pass


def _ensure_index(conn, ddl: str) -> None:
    try:
        conn.execute(text(ddl))
        conn.commit()
    except Exception:
        pass


def _assign_resource_codes(
    db: Session,
    model,
    prefix: str,
    label_getter: Callable[[object], Optional[str]],
) -> None:
    rows = (
        db.query(model)
        .order_by(model.id.asc())
        .all()
    )
    updated = False
    for row in rows:
        if is_valid_resource_code(getattr(row, "code", None)):
            continue
        row.code = build_resource_code(prefix, preferred=label_getter(row), entity_id=row.id)
        updated = True
    if updated:
        db.commit()


def _migrate_scenario_step_refs(db: Session) -> None:
    interface_code_map = {
        row.id: row.code
        for row in db.query(Interface.id, Interface.code).all()
        if row.code
    }
    case_code_map = {
        row.id: row.code
        for row in db.query(TestCase.id, TestCase.code).all()
        if row.code
    }

    updated = False
    scenarios = db.query(TestScenario).all()
    for scenario in scenarios:
        steps = scenario.steps or []
        normalized_steps = []
        scenario_changed = False
        for step in steps:
            if not isinstance(step, dict):
                normalized_steps.append(step)
                continue

            next_step = dict(step)
            interface_ref = next_step.get("interface_id")
            case_ref = next_step.get("case_id")

            if isinstance(interface_ref, int) and interface_code_map.get(interface_ref):
                next_step["interface_id"] = interface_code_map[interface_ref]
                scenario_changed = True
            if isinstance(case_ref, int) and case_code_map.get(case_ref):
                next_step["case_id"] = case_code_map[case_ref]
                scenario_changed = True

            normalized_steps.append(next_step)

        if scenario_changed:
            scenario.steps = normalized_steps
            updated = True

    if updated:
        db.commit()


def init_db():
    Base.metadata.create_all(bind=engine)

    with engine.connect() as conn:
        _ensure_column(
            conn,
            "api_environments",
            "urls",
            "ALTER TABLE api_environments ADD COLUMN urls JSON",
        )
        _ensure_column(
            conn,
            "api_environments",
            "variables",
            "ALTER TABLE api_environments ADD COLUMN variables JSON",
        )
        _ensure_column(
            conn,
            "api_test_cases",
            "case_type",
            "ALTER TABLE api_test_cases ADD COLUMN case_type VARCHAR(20) DEFAULT 'test'",
        )
        _ensure_column(
            conn,
            "api_interfaces",
            "post_operations",
            "ALTER TABLE api_interfaces ADD COLUMN post_operations JSON",
        )
        _ensure_column(
            conn,
            "api_test_cases",
            "post_operations",
            "ALTER TABLE api_test_cases ADD COLUMN post_operations JSON",
        )
        _ensure_column(
            conn,
            "api_test_cases",
            "pre_operations",
            "ALTER TABLE api_test_cases ADD COLUMN pre_operations JSON",
        )
        _ensure_column(
            conn,
            "functional_test_cases",
            "code",
            "ALTER TABLE functional_test_cases ADD COLUMN code VARCHAR(128) NULL",
        )
        _ensure_column(
            conn,
            "requirement_groups",
            "code",
            "ALTER TABLE requirement_groups ADD COLUMN code VARCHAR(128) NULL",
        )
        _ensure_column(
            conn,
            "api_folders",
            "code",
            "ALTER TABLE api_folders ADD COLUMN code VARCHAR(128) NULL",
        )
        _ensure_column(
            conn,
            "api_interfaces",
            "code",
            "ALTER TABLE api_interfaces ADD COLUMN code VARCHAR(128) NULL",
        )
        _ensure_column(
            conn,
            "api_test_cases",
            "code",
            "ALTER TABLE api_test_cases ADD COLUMN code VARCHAR(128) NULL",
        )
        _ensure_column(
            conn,
            "api_environments",
            "code",
            "ALTER TABLE api_environments ADD COLUMN code VARCHAR(128) NULL",
        )
        _ensure_column(
            conn,
            "test_scenarios",
            "code",
            "ALTER TABLE test_scenarios ADD COLUMN code VARCHAR(128) NULL",
        )
        _ensure_column(
            conn,
            "scenario_test_reports",
            "code",
            "ALTER TABLE scenario_test_reports ADD COLUMN code VARCHAR(128) NULL",
        )
        _ensure_index(conn, "CREATE UNIQUE INDEX uq_functional_test_cases_code ON functional_test_cases (code)")
        _ensure_index(conn, "CREATE UNIQUE INDEX uq_requirement_groups_code ON requirement_groups (code)")
        _ensure_index(conn, "CREATE UNIQUE INDEX uq_api_folders_code ON api_folders (code)")
        _ensure_index(conn, "CREATE UNIQUE INDEX uq_api_interfaces_code ON api_interfaces (code)")
        _ensure_index(conn, "CREATE UNIQUE INDEX uq_api_test_cases_code ON api_test_cases (code)")
        _ensure_index(conn, "CREATE UNIQUE INDEX uq_api_environments_code ON api_environments (code)")
        _ensure_index(conn, "CREATE UNIQUE INDEX uq_test_scenarios_code ON test_scenarios (code)")
        _ensure_index(conn, "CREATE UNIQUE INDEX uq_scenario_test_reports_code ON scenario_test_reports (code)")

        try:
            conn.execute(text("SELECT requirement_group_id FROM api_test_cases LIMIT 1"))
        except Exception:
            try:
                conn.execute(text("ALTER TABLE api_test_cases MODIFY COLUMN interface_id INT NULL"))
                conn.execute(
                    text(
                        "ALTER TABLE api_test_cases ADD COLUMN requirement_group_id INT NULL, "
                        "ADD INDEX ix_api_test_cases_requirement_group_id (requirement_group_id)"
                    )
                )
                conn.commit()
                conn.execute(
                    text(
                        "ALTER TABLE api_test_cases ADD CONSTRAINT fk_api_test_cases_requirement_group "
                        "FOREIGN KEY (requirement_group_id) REFERENCES requirement_groups(id) ON DELETE CASCADE"
                    )
                )
                conn.commit()
            except Exception:
                pass

    db = SessionLocal()
    try:
        _assign_resource_codes(db, Folder, "folder", lambda row: row.name)
        _assign_resource_codes(db, Interface, "interface", lambda row: f"{row.name or ''} {row.path or ''}")
        _assign_resource_codes(db, TestCase, "test-case", lambda row: row.name)
        _assign_resource_codes(db, Environment, "environment", lambda row: row.name)
        _assign_resource_codes(db, TestScenario, "test-scenario", lambda row: row.name)
        _assign_resource_codes(
            db,
            ScenarioTestReport,
            "scenario-report",
            lambda row: row.title or row.creator or "report",
        )
        _assign_resource_codes(
            db,
            RequirementGroup,
            "requirement-group",
            lambda row: row.doc_title,
        )
        _assign_resource_codes(
            db,
            FunctionalTestCase,
            "functional-case",
            lambda row: row.case_code or row.title,
        )
        _migrate_scenario_step_refs(db)
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
