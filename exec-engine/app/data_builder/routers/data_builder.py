from fastapi import APIRouter, HTTPException

from app.data_builder.config import get_settings
from app.data_builder.schemas.generate import ExecuteIn, ExecuteOut, GeneratePreviewIn, GeneratePreviewOut
from app.data_builder.schemas.mysql import (
    ConnectionTestOut,
    MySQLConnectionIn,
    SchemaSyncBatchIn,
    SchemaSyncBatchOut,
    SchemaSyncIn,
    TableListOut,
    TableSchemaOut,
)
from app.data_builder.schemas.orchestrate import (
    OrchestrateExecuteIn,
    OrchestrateExecuteOut,
    WritePlanCotOut,
    WritePlanIn,
    WritePlanOut,
    WritePlanPlannerOut,
    WritePlanStepsIn,
)
from app.data_builder.schemas.query import Nl2SqlIn, Nl2SqlOut, QueryExecuteIn, QueryExecuteOut
from app.data_builder.schemas.relationships import RelationshipsIn, RelationshipsOut
from app.data_builder.schemas.settings import DataBuilderSettingsOut, DataBuilderSettingsPatch
from app.data_builder.services import mysql_meta
from app.data_builder.services.nl2sql import generate_nl2sql
from app.data_builder.services.orchestrate_execute import execute_orchestration
from app.data_builder.services.preview_stub import build_stub_preview
from app.data_builder.services.prompt_library import list_prompt_library
from app.data_builder.services.query_execute import execute_readonly_query
from app.data_builder.services.relationships import discover_relationships
from app.data_builder.services.write_plan_llm import (
    generate_write_plan,
    generate_write_plan_cot,
    generate_write_plan_planner,
    generate_write_plan_steps,
)
from app.data_builder.state import settings_store

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


@router.post("/schema/sync-batch", response_model=SchemaSyncBatchOut)
def schema_sync_batch(body: SchemaSyncBatchIn):
    try:
        rows = mysql_meta.sync_tables_schema_batch(body, body.tables)
        schemas = [TableSchemaOut(database=db, table=table, columns=columns) for db, table, columns in rows]
        return SchemaSyncBatchOut(schemas=schemas)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/schema/relationships", response_model=RelationshipsOut)
def schema_relationships(body: RelationshipsIn):
    try:
        return discover_relationships(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=mysql_meta.normalize_mysql_error(exc)) from exc


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


@router.post("/query/nl2sql", response_model=Nl2SqlOut)
def query_nl2sql(body: Nl2SqlIn):
    _ = get_settings()
    try:
        return generate_nl2sql(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/generate/write-plan", response_model=WritePlanOut)
def generate_write_plan_ep(body: WritePlanIn):
    _ = get_settings()
    try:
        return generate_write_plan(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/generate/write-plan/planner", response_model=WritePlanPlannerOut)
def generate_write_plan_planner_ep(body: WritePlanIn):
    _ = get_settings()
    try:
        return generate_write_plan_planner(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/generate/write-plan/steps", response_model=WritePlanOut)
def generate_write_plan_steps_ep(body: WritePlanStepsIn):
    _ = get_settings()
    try:
        return generate_write_plan_steps(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/generate/write-plan/cot", response_model=WritePlanCotOut)
def generate_write_plan_cot_ep(body: WritePlanIn):
    _ = get_settings()
    try:
        return generate_write_plan_cot(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/orchestrate/execute", response_model=OrchestrateExecuteOut)
def orchestrate_execute_ep(body: OrchestrateExecuteIn):
    _ = get_settings()
    try:
        return execute_orchestration(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=mysql_meta.normalize_mysql_error(exc)) from exc


@router.post("/query/execute", response_model=QueryExecuteOut)
def query_execute(body: QueryExecuteIn):
    _ = get_settings()
    try:
        return execute_readonly_query(body)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=400, detail=mysql_meta.normalize_mysql_error(exc)) from exc


@router.post("/execute", response_model=ExecuteOut)
def execute_stub(body: ExecuteIn):
    if not body.confirm:
        return ExecuteOut(accepted=False, message="请确认后再执行（confirm=true）", task_id=None)
    return ExecuteOut(
        accepted=False,
        message="请改用「多语句写入编排」接口：POST /api/v1/orchestrate/execute（confirm=true 提交事务）。",
        task_id=None,
    )


@router.get("/prompts/library")
def prompts_library():
    return {"items": [m.model_dump() for m in list_prompt_library()]}
