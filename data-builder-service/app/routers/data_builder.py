from fastapi import APIRouter, HTTPException

from app.config import get_settings
from app.schemas.generate import ExecuteIn, ExecuteOut, GeneratePreviewIn, GeneratePreviewOut
from app.schemas.mysql import ConnectionTestOut, MySQLConnectionIn, SchemaSyncIn, TableListOut, TableSchemaOut
from app.schemas.settings import DataBuilderSettingsOut, DataBuilderSettingsPatch
from app.services import mysql_meta
from app.services.preview_stub import build_stub_preview
from app.services.prompt_library import list_prompt_library
from app.state import settings_store

router = APIRouter()


@router.post("/connections/test", response_model=ConnectionTestOut)
def connections_test(body: MySQLConnectionIn):
    ok, msg, ver = mysql_meta.test_mysql(body)
    return ConnectionTestOut(ok=ok, message=msg, server_version=ver)


@router.post("/connections/tables", response_model=TableListOut)
def connections_tables(body: MySQLConnectionIn):
    try:
        tables = mysql_meta.list_base_tables(body)
        return TableListOut(tables=tables)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/schema/sync", response_model=TableSchemaOut)
def schema_sync(body: SchemaSyncIn):
    try:
        db, table, columns = mysql_meta.sync_table_schema(body, body.table)
        return TableSchemaOut(database=db, table=table, columns=columns)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/settings", response_model=DataBuilderSettingsOut)
def settings_get():
    eff = settings_store.get_effective_settings()
    return DataBuilderSettingsOut(
        encrypt_fulltext_enabled=bool(eff["encrypt_fulltext_enabled"]),
        max_insert_select_rows=int(eff["max_insert_select_rows"]),
    )


@router.patch("/settings", response_model=DataBuilderSettingsOut)
def settings_patch(body: DataBuilderSettingsPatch):
    settings_store.patch_settings(
        encrypt_fulltext_enabled=body.encrypt_fulltext_enabled,
        max_insert_select_rows=body.max_insert_select_rows,
    )
    eff = settings_store.get_effective_settings()
    return DataBuilderSettingsOut(
        encrypt_fulltext_enabled=bool(eff["encrypt_fulltext_enabled"]),
        max_insert_select_rows=int(eff["max_insert_select_rows"]),
    )


@router.post("/generate/preview", response_model=GeneratePreviewOut)
def generate_preview(body: GeneratePreviewIn):
    _ = get_settings()
    return build_stub_preview(
        instruction=body.instruction,
        target_table=body.target_table,
        table_schema=body.table_schema,
        generation_mode=body.generation_mode,
    )


@router.post("/execute", response_model=ExecuteOut)
def execute_stub(body: ExecuteIn):
    if not body.confirm:
        return ExecuteOut(accepted=False, message="请确认后再执行（confirm=true）", task_id=None)
    return ExecuteOut(
        accepted=False,
        message="批量写入引擎将在后续版本接入；当前仅支持预览与 Schema 联调。",
        task_id=None,
    )


@router.get("/prompts/library")
def prompts_library():
    return {"items": [m.model_dump() for m in list_prompt_library()]}
