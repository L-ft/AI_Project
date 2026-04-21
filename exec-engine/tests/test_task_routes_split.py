from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.data_builder.routers import data_builder_tasks_internal, data_builder_tasks_legacy


def _app() -> FastAPI:
    app = FastAPI()
    app.include_router(data_builder_tasks_legacy.router, prefix="/api/v1")
    app.include_router(data_builder_tasks_internal.router, prefix="/api/v1")
    return app


def _manifest() -> dict:
    return {
        "database_context": {"database": "db"},
        "generation": {
            "sql_template": "INSERT INTO `target_table` (`name`) VALUES (:name)",
            "bindings": [],
            "batching": {"batch_count": 1},
        },
    }


def _mysql() -> dict:
    return {"host": "127.0.0.1", "port": 3306, "user": "u", "password": "", "database": "db"}


def test_legacy_create_task_route_still_available(monkeypatch):
    monkeypatch.setattr(data_builder_tasks_legacy, "validate_manifest", lambda manifest: None)
    client = TestClient(_app())

    res = client.post(
        "/api/v1/data-builder/tasks",
        json={"manifest": _manifest(), "mysql": _mysql()},
    )

    assert res.status_code == 201
    payload = res.json()
    assert payload["status"] == "PENDING"
    assert payload["manifest"]["task_id"]


def test_internal_execute_batch_requires_token_and_stays_stateless(monkeypatch):
    monkeypatch.setenv("DATA_BUILDER_EXEC_INTERNAL_TOKEN", "secret-token")
    monkeypatch.setattr(data_builder_tasks_internal, "validate_manifest", lambda manifest: None)
    monkeypatch.setattr(
        data_builder_tasks_internal,
        "execute_batch_payload",
        lambda task_id, manifest, mysql, batch_index, dry_run=False: {
            "task_id": task_id,
            "status": "RUNNING",
            "batch_index": batch_index,
            "rows_affected": 2,
            "assertions_evaluated": False,
            "assertion_summary": None,
            "assertion_runs": [],
        },
    )
    client = TestClient(_app())
    body = {
        "task_id": "task-1",
        "manifest": _manifest(),
        "mysql": _mysql(),
        "batch_index": 0,
        "dry_run": False,
    }

    forbidden = client.post("/api/v1/data-builder/internal/execute-batch", json=body)
    assert forbidden.status_code == 403
    assert forbidden.json()["detail"]["code"] == "DB_INTERNAL_FORBIDDEN"

    ok = client.post(
        "/api/v1/data-builder/internal/execute-batch",
        json=body,
        headers={"x-data-builder-internal-token": "secret-token"},
    )
    assert ok.status_code == 200
    assert ok.json()["task_id"] == "task-1"


def test_openapi_marks_legacy_routes_deprecated_and_internal_routes_active():
    client = TestClient(_app())
    openapi = client.get("/openapi.json")

    assert openapi.status_code == 200
    paths = openapi.json()["paths"]
    assert paths["/api/v1/data-builder/tasks"]["post"]["deprecated"] is True
    assert "fallback" in paths["/api/v1/data-builder/tasks"]["post"]["description"]
    assert paths["/api/v1/data-builder/internal/execute-batch"]["post"].get("deprecated") is not True
    assert "Internal-only stateless execution route" in paths["/api/v1/data-builder/internal/execute-batch"]["post"]["description"]
