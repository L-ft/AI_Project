import dataBuilderClient, { getL3TasksHttpClient, getL3TasksPathPrefix } from './data-builder-client'

export { useDataBuilderTasksViaMgmt } from './data-builder-client'

export interface MySQLConnectionBody {
  host: string
  port: number
  user: string
  password: string
  database: string
}

export interface ConnectionTestResult {
  ok: boolean
  message: string
  server_version?: string | null
}

export interface TableListResult {
  tables: string[]
}

export interface ColumnInfo {
  name: string
  data_type: string
  column_type: string
  nullable: boolean
  default?: string | null
  comment: string
  extra: string
}

export interface TableSchemaResult {
  database: string
  table: string
  columns: ColumnInfo[]
}

export interface DataBuilderSettings {
  encrypt_fulltext_enabled: boolean
  max_insert_select_rows: number
}

export interface BindingItem {
  placeholder: string
  column: string
  strategy: string
  params: Record<string, unknown>
}

export interface GeneratePreviewResult {
  rationale: string
  sql_template: string
  bindings: BindingItem[]
  generation_mode: 'template' | 'semantic'
  estimated_total_rows: number
  stub?: boolean
}

export interface PromptLibraryItem {
  id: string
  title: string
  instruction: string
}

export async function testMysqlConnection(body: MySQLConnectionBody): Promise<ConnectionTestResult> {
  return dataBuilderClient.post('/api/v1/connections/test', body) as Promise<ConnectionTestResult>
}

export async function listMysqlTables(body: MySQLConnectionBody): Promise<TableListResult> {
  return dataBuilderClient.post('/api/v1/connections/tables', body) as Promise<TableListResult>
}

export async function syncTableSchema(
  body: MySQLConnectionBody & { table: string }
): Promise<TableSchemaResult> {
  return dataBuilderClient.post('/api/v1/schema/sync', body) as Promise<TableSchemaResult>
}

export async function syncTableSchemasBatch(
  body: MySQLConnectionBody & { tables: string[] }
): Promise<{ schemas: TableSchemaResult[] }> {
  return dataBuilderClient.post('/api/v1/schema/sync-batch', body) as Promise<{ schemas: TableSchemaResult[] }>
}

export async function getDataBuilderSettings(): Promise<DataBuilderSettings> {
  return dataBuilderClient.get('/api/v1/settings') as Promise<DataBuilderSettings>
}

export async function patchDataBuilderSettings(
  patch: Partial<Pick<DataBuilderSettings, 'encrypt_fulltext_enabled' | 'max_insert_select_rows'>>
): Promise<DataBuilderSettings> {
  return dataBuilderClient.patch('/api/v1/settings', patch) as Promise<DataBuilderSettings>
}

export async function generatePreview(body: {
  instruction: string
  target_table: string
  table_schema: Record<string, unknown>
  generation_mode: 'template' | 'semantic'
}): Promise<GeneratePreviewResult> {
  return dataBuilderClient.post('/api/v1/generate/preview', body) as Promise<GeneratePreviewResult>
}

export async function executePlan(body: { plan: Record<string, unknown>; confirm: boolean }): Promise<{
  accepted: boolean
  message: string
  task_id: string | null
}> {
  return dataBuilderClient.post('/api/v1/execute', body) as Promise<{
    accepted: boolean
    message: string
    task_id: string | null
  }>
}

export async function getPromptLibrary(): Promise<{ items: PromptLibraryItem[] }> {
  return dataBuilderClient.get('/api/v1/prompts/library') as Promise<{ items: PromptLibraryItem[] }>
}

export type LlmProviderId = 'deepseek' | 'qwen' | 'openai_compatible'

export interface Nl2SqlBody {
  instruction: string
  /** 单表（兼容旧用法）；与 tables_schema 二选一，优先 tables_schema */
  table_schema?: Record<string, unknown>
  /** 多表 schema，每项含 database、table、columns */
  tables_schema?: Array<{ database: string; table: string; columns: ColumnInfo[] }>
  provider: LlmProviderId
  model: string
  api_key: string
  base_url?: string | null
}

export interface Nl2SqlResult {
  sql: string
  rationale?: string
}

export async function nl2sqlGenerate(body: Nl2SqlBody): Promise<Nl2SqlResult> {
  return dataBuilderClient.post('/api/v1/query/nl2sql', body) as Promise<Nl2SqlResult>
}

export interface QueryExecuteBody extends MySQLConnectionBody {
  sql: string
  max_rows?: number
  timeout_seconds?: number
}

export interface QueryExecuteResult {
  columns: string[]
  rows: Record<string, unknown>[]
  truncated: boolean
  row_count: number
}

export async function executeReadonlyQuery(body: QueryExecuteBody): Promise<QueryExecuteResult> {
  return dataBuilderClient.post('/api/v1/query/execute', body) as Promise<QueryExecuteResult>
}

export interface RelationshipEdge {
  from_table: string
  from_column: string
  to_table: string
  to_column: string
  source: 'fk' | 'heuristic'
  confidence: number
}

export async function fetchSchemaRelationships(
  body: MySQLConnectionBody & { tables: string[] }
): Promise<{ edges: RelationshipEdge[] }> {
  return dataBuilderClient.post('/api/v1/schema/relationships', body) as Promise<{ edges: RelationshipEdge[] }>
}

export interface OrchestrateStepPayload {
  id: string
  kind: 'readonly' | 'write'
  sql: string
  max_rows?: number | null
  foreach_source_step_id?: string | null
}

export interface OrchestrateStepResult {
  step_id: string
  kind: 'readonly' | 'write'
  row_count: number
  affected_rows: number
  truncated: boolean
  columns: string[]
  sample_rows: Record<string, unknown>[]
}

export interface OrchestrateExecuteResult {
  ok: boolean
  message: string
  results: OrchestrateStepResult[]
}

export async function orchestrateExecute(body: MySQLConnectionBody & {
  confirm: boolean
  steps: OrchestrateStepPayload[]
}): Promise<OrchestrateExecuteResult> {
  return dataBuilderClient.post('/api/v1/orchestrate/execute', body) as Promise<OrchestrateExecuteResult>
}

export async function generateWritePlan(body: {
  instruction: string
  tables_schema: Array<{ database: string; table: string; columns: ColumnInfo[] }>
  relation_hints?: string[]
  provider: LlmProviderId
  model: string
  api_key: string
  base_url?: string | null
}): Promise<{ rationale: string; steps: OrchestrateStepPayload[] }> {
  return dataBuilderClient.post('/api/v1/generate/write-plan', body) as Promise<{
    rationale: string
    steps: OrchestrateStepPayload[]
  }>
}

/** CoT 第一段：规划器 JSON（与后端 WritePlanPlannerOut 对齐） */
export interface WritePlanPlanner {
  rationale: string
  self_qa: Array<{ question: string; answer: string }>
  must_reference: string[]
  ordered_tables: string[]
  execution_strategy:
    | 'single_insert_select'
    | 'multi_step_select_then_insert'
    | 'foreach_template_from_prior_select'
    | 'mixed'
  bulk_insert_feasible: boolean
  bulk_insert_notes: string
  risky_columns: string[]
  generator_directives: string
}

export async function generateWritePlanPlanner(body: {
  instruction: string
  tables_schema: Array<{ database: string; table: string; columns: ColumnInfo[] }>
  relation_hints?: string[]
  provider: LlmProviderId
  model: string
  api_key: string
  base_url?: string | null
}): Promise<WritePlanPlanner> {
  return dataBuilderClient.post('/api/v1/generate/write-plan/planner', body) as Promise<WritePlanPlanner>
}

export async function generateWritePlanSteps(body: {
  instruction: string
  tables_schema: Array<{ database: string; table: string; columns: ColumnInfo[] }>
  relation_hints?: string[]
  planner: Record<string, unknown>
  provider: LlmProviderId
  model: string
  api_key: string
  base_url?: string | null
}): Promise<{ rationale: string; steps: OrchestrateStepPayload[] }> {
  return dataBuilderClient.post('/api/v1/generate/write-plan/steps', body) as Promise<{
    rationale: string
    steps: OrchestrateStepPayload[]
  }>
}

// --- L3 Manifest 任务（默认直连 exec-engine；VITE_DATA_BUILDER_VIA_MGMT=true 时走 mgmt-api 代理）---

export type TaskStatusL3 =
  | 'PENDING'
  | 'RUNNING'
  | 'COMPLETED_OK'
  | 'FAILED_ASSERTION'
  | 'FAILED_EXECUTION'

export type CleanupStateL3 = 'not_applicable' | 'eligible' | 'completed' | 'blocked'

export interface BatchProgressL3 {
  batch_count: number
  completed_batches: number
  current_batch_index: number | null
  rows_inserted_total?: number
}

export interface AssertionSummaryL3 {
  evaluated: boolean
  passed: boolean
  failed_rules?: string[]
}

export interface AssertionRunItemL3 {
  assertion_id: string
  assertion_type?: 'scalar' | 'rowset'
  passed: boolean
  actual?: unknown
  expect?: unknown
  error_code?: string | null
  message?: string | null
  primary_key_columns?: string[] | null
  sample_rows?: Record<string, unknown>[] | null
  truncated?: boolean
}

export interface CleanupStatusL3 {
  state: CleanupStateL3
  blocked_reason?: string | null
}

/** GET 合同 M1：`runtime.assertion_summary` 为条数统计 */
export interface RuntimeAssertionSummaryL3 {
  total: number
  passed: number
}

export interface TaskRuntimeL3 {
  batch_progress: BatchProgressL3
  last_heartbeat_at?: string | null
  last_batch_started_at?: string | null
  cleanup_status: CleanupStatusL3
  assertion_summary: RuntimeAssertionSummaryL3
}

export interface TaskDetailL3 {
  task_id: string
  status: TaskStatusL3
  manifest: Record<string, unknown>
  batch_progress: BatchProgressL3
  last_heartbeat_at?: string | null
  last_batch_started_at?: string | null
  assertion_summary: AssertionSummaryL3
  assertion_runs?: AssertionRunItemL3[]
  cleanup_status: CleanupStatusL3
  row_map_flush_lag?: number
  last_error?: { code?: string; message?: string; details?: unknown } | null
  /** M1 OpenAPI：轮询核心对象（与顶层字段镜像，断言为 total/passed 计数） */
  runtime?: TaskRuntimeL3
}

export interface CreateDataBuilderTaskBody {
  manifest?: Record<string, unknown>
  mysql: MySQLConnectionBody
  /** 经 mgmt-api 时与 manifest 二选一 */
  prompt?: string
  table_hint?: string
}

export async function createDataBuilderTask(body: CreateDataBuilderTaskBody): Promise<{
  task_id: string
  status: TaskStatusL3
  manifest: Record<string, unknown>
}> {
  const p = getL3TasksPathPrefix()
  return getL3TasksHttpClient().post(`${p}/tasks`, body) as Promise<{
    task_id: string
    status: TaskStatusL3
    manifest: Record<string, unknown>
  }>
}

export async function listDataBuilderTasks(limit = 50): Promise<TaskDetailL3[]> {
  const p = getL3TasksPathPrefix()
  return getL3TasksHttpClient().get(`${p}/tasks`, { params: { limit } }) as Promise<TaskDetailL3[]>
}

export async function getDataBuilderTask(
  taskId: string,
  options?: { skipErrorToast?: boolean }
): Promise<TaskDetailL3> {
  const p = getL3TasksPathPrefix()
  return getL3TasksHttpClient().get(`${p}/tasks/${taskId}`, {
    skipErrorToast: options?.skipErrorToast === true
  } as Record<string, unknown>) as Promise<TaskDetailL3>
}

export async function executeDataBuilderBatch(
  taskId: string,
  batchIndex: number,
  dryRun = false
): Promise<{
  task_id: string
  status: TaskStatusL3
  batch_index: number
  rows_affected: number
  assertions_evaluated: boolean
  assertion_summary: AssertionSummaryL3 | null
}> {
  const p = getL3TasksPathPrefix()
  return getL3TasksHttpClient().post(`${p}/tasks/${taskId}/execute-batch`, {
    batch_index: batchIndex,
    dry_run: dryRun
  }) as Promise<{
    task_id: string
    status: TaskStatusL3
    batch_index: number
    rows_affected: number
    assertions_evaluated: boolean
    assertion_summary: AssertionSummaryL3 | null
  }>
}

export async function cleanupDataBuilderTask(
  taskId: string,
  confirm: boolean,
  actor?: string
): Promise<{
  task_id: string
  deleted_by_table: Record<string, number>
  mode_used?: string | null
  cleanup_completed_at?: string | null
  cleanup_completed_by?: string | null
  idempotent_replay?: boolean
}> {
  const p = getL3TasksPathPrefix()
  return getL3TasksHttpClient().post(`${p}/tasks/${taskId}/cleanup`, {
    confirm,
    actor: actor ?? 'ui'
  }) as Promise<{
    task_id: string
    deleted_by_table: Record<string, number>
    mode_used?: string | null
    cleanup_completed_at?: string | null
    cleanup_completed_by?: string | null
    idempotent_replay?: boolean
  }>
}

export async function generateWritePlanCot(body: {
  instruction: string
  tables_schema: Array<{ database: string; table: string; columns: ColumnInfo[] }>
  relation_hints?: string[]
  provider: LlmProviderId
  model: string
  api_key: string
  base_url?: string | null
}): Promise<{ planner: WritePlanPlanner; write_plan: { rationale: string; steps: OrchestrateStepPayload[] } }> {
  return dataBuilderClient.post('/api/v1/generate/write-plan/cot', body) as Promise<{
    planner: WritePlanPlanner
    write_plan: { rationale: string; steps: OrchestrateStepPayload[] }
  }>
}
