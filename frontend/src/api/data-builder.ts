import dataBuilderClient from './data-builder-client'

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
