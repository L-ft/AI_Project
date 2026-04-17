import { createHttpClient } from './core/create-client'
import { getMgmtApiBaseURL } from './core/mgmt-base'
import { message } from '../utils/naive-api'
import { type AppError } from './core/errors'
import type { AxiosInstance } from 'axios'

function getDataBuilderBaseURL(): string {
  const fromEnv = import.meta.env.VITE_DATA_BUILDER_URL as string | undefined
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  return import.meta.env.DEV ? '/data-builder' : '/data-builder'
}

function detailFromAxiosData(data: unknown): string {
  if (data == null) return ''
  if (typeof data === 'string') return data
  if (typeof data === 'object' && 'detail' in data) {
    const d = (data as { detail: unknown }).detail
    if (typeof d === 'string') return d
    if (Array.isArray(d)) return JSON.stringify(d)
  }
  try {
    return JSON.stringify(data)
  } catch {
    return String(data)
  }
}

function buildDataBuilderOnError(labelForNetwork: string) {
  return (error: { code?: string; message?: string; response?: { data?: unknown } }, appError: AppError) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message.error('数据构建服务请求超时，请稍后重试')
      return
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
      message.error(labelForNetwork)
      return
    }
    const status = appError.status
    const body = error.response?.data
    if (status === 401 || status === 403) {
      message.error(appError.message || '无权限访问数据构建服务')
      return
    }
    if (status === 404) {
      const raw = body as { detail?: { code?: string; message?: string } } | undefined
      if (raw?.detail?.code === 'DB_TASK_NOT_FOUND') {
        message.error(
          'L3 任务已不存在（exec-engine 重启后任务仅存内存会丢失）。请点「刷新任务列表」或重新「创建任务」后再操作。'
        )
        return
      }
    }
    if (status === 502) {
      message.error('数据构建服务不可用 (502)，请检查上游与 Nginx 配置')
      return
    }
    const extra = detailFromAxiosData(body)
    message.error(
      extra ? `${appError.message || '请求失败'}：${extra}` : appError.message || '请求失败'
    )
  }
}

const dataBuilderClient = createHttpClient({
  baseURL: getDataBuilderBaseURL(),
  timeout: 120_000,
  unwrapResponse: (response) => response.data,
  onError: buildDataBuilderOnError(
    '无法连接数据构建服务，请确认 data-builder 已启动且网关 /data-builder 可用'
  )
})

/** L3 任务是否经 mgmt-api 转发至 exec-engine（需后端已挂载 v1/data-builder 代理）。 */
export function useDataBuilderTasksViaMgmt(): boolean {
  const v = import.meta.env.VITE_DATA_BUILDER_VIA_MGMT as string | undefined
  return v === 'true' || v === '1'
}

let _l3MgmtPassthroughClient: AxiosInstance | null = null

/** L3 任务专用：直连 exec-engine（默认）或走 mgmt 透传（与 exec 相同原始 JSON，非 {code,data} 包装）。 */
export function getL3TasksHttpClient(): AxiosInstance {
  if (!useDataBuilderTasksViaMgmt()) {
    return dataBuilderClient
  }
  if (!_l3MgmtPassthroughClient) {
    _l3MgmtPassthroughClient = createHttpClient({
      baseURL: getMgmtApiBaseURL(),
      timeout: 130_000,
      unwrapResponse: (response) => response.data,
      onError: buildDataBuilderOnError(
        '无法连接管理 API 或 L3 代理未就绪，请确认 mgmt-api 已启动且 EXEC_ENGINE_URL 正确'
      )
    })
  }
  return _l3MgmtPassthroughClient
}

/** L3 路径前缀：经 mgmt 时为 /v1/data-builder（配合 baseURL=/api），直连时为 /api/v1/data-builder（配合 baseURL=/data-builder）。 */
export function getL3TasksPathPrefix(): string {
  return useDataBuilderTasksViaMgmt() ? '/v1/data-builder' : '/api/v1/data-builder'
}

export default dataBuilderClient
