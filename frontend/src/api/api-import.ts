import execRequest from './exec-request'

export interface ImportPreviewItem {
  name: string
  method: string
  path: string
  query_params: Array<Record<string, unknown>>
  header_params: Array<Record<string, unknown>>
  /** OpenAPI 路径参数，导入时与 query 合并展示 */
  path_params?: Array<Record<string, unknown>>
  body_definition: { type: string; content: string }
}

export interface ImportPreviewMeta {
  /** OpenAPI paths 对象下的路径键数量（与解析出的操作数对照，便于排查「文档里多条路径却只解析一条」） */
  paths_key_count?: number
  paths_keys_sample?: string[]
  openapi_version?: string
  operations_parsed?: number
}

export interface ImportPreviewResponse {
  format: string
  count: number
  items: ImportPreviewItem[]
  meta?: ImportPreviewMeta
}

/** 阶段 1：OpenAPI / Postman / HAR / cURL 解析为调试区可填充结构 */
export async function previewApiImport(format: string, content: string): Promise<ImportPreviewResponse> {
  return (await execRequest.post('/api-import/preview', {
    format,
    content,
  })) as ImportPreviewResponse
}
