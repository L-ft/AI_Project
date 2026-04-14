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
