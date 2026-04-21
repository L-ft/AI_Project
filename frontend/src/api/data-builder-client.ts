import type { AxiosInstance } from 'axios'

import { type AppError } from './core/errors'
import { getMgmtApiBaseURL } from './core/mgmt-base'
import { createHttpClient } from './core/create-client'
import { message } from '../utils/naive-api'

function getDataBuilderBaseURL(): string {
  const fromEnv = import.meta.env.VITE_DATA_BUILDER_URL as string | undefined
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  return '/data-builder'
}

function detailFromAxiosData(data: unknown): string {
  if (data == null) return ''
  if (typeof data === 'string') return data
  if (typeof data === 'object' && 'detail' in data) {
    const detail = (data as { detail: unknown }).detail
    if (typeof detail === 'string') return detail
    if (Array.isArray(detail)) return JSON.stringify(detail)
  }
  try {
    return JSON.stringify(data)
  } catch {
    return String(data)
  }
}

/** R4 起默认走 mgmt-api；需要排障或对比旧链路时可显式设为 false。 */
export function useDataBuilderTasksViaMgmt(): boolean {
  const raw = import.meta.env.VITE_DATA_BUILDER_VIA_MGMT as string | undefined
  if (raw == null || String(raw).trim() === '') {
    return true
  }
  const normalized = String(raw).trim().toLowerCase()
  if (['false', '0', 'no', 'off'].includes(normalized)) {
    return false
  }
  if (['true', '1', 'yes', 'on'].includes(normalized)) {
    return true
  }
  return true
}

function buildTaskNotFoundMessage(): string {
  if (useDataBuilderTasksViaMgmt()) {
    return 'L3 任务在管理端已不存在。请刷新任务列表；若任务已被删除或重建，请重新选择或重新创建。'
  }
  return 'L3 任务已不存在（直连 exec-engine 时任务仅保存在进程内存）。请点“刷新任务列表”或重新“创建任务”后再操作。'
}

function buildDataBuilderOnError(labelForNetwork: string) {
  return (
    error: { code?: string; message?: string; response?: { data?: unknown } },
    appError: AppError,
  ) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message.error('数据构建服务请求超时，请稍后重试')
      return
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
      message.error(labelForNetwork)
      return
    }

    const status = appError.status
    const body = error.response.data

    if (status === 401 || status === 403) {
      message.error(appError.message || '无权限访问数据构建服务')
      return
    }

    if (status === 404) {
      const raw = body as { detail?: { code?: string } } | undefined
      if (raw?.detail?.code === 'DB_TASK_NOT_FOUND') {
        message.error(buildTaskNotFoundMessage())
        return
      }
    }

    if (status === 502) {
      message.error('数据构建服务不可用 (502)，请检查上游服务与网关配置')
      return
    }

    const extra = detailFromAxiosData(body)
    message.error(extra ? `${appError.message || '请求失败'}：${extra}` : appError.message || '请求失败')
  }
}

const dataBuilderClient = createHttpClient({
  baseURL: getDataBuilderBaseURL(),
  timeout: 120_000,
  unwrapResponse: (response) => response.data,
  onError: buildDataBuilderOnError(
    '无法连接数据构建服务，请确认 data-builder 已启动且网关 /data-builder 可用',
  ),
})

let l3MgmtPassthroughClient: AxiosInstance | null = null

/** L3 任务专用：默认走 mgmt-api；需要排障时可通过 VITE_DATA_BUILDER_VIA_MGMT=false 切回直连 exec-engine。 */
export function getL3TasksHttpClient(): AxiosInstance {
  if (!useDataBuilderTasksViaMgmt()) {
    return dataBuilderClient
  }
  if (!l3MgmtPassthroughClient) {
    l3MgmtPassthroughClient = createHttpClient({
      baseURL: getMgmtApiBaseURL(),
      timeout: 130_000,
      unwrapResponse: (response) => response.data,
      onError: buildDataBuilderOnError(
        '无法连接管理 API 或 L3 编排链路未就绪，请确认 mgmt-api 已启动且执行编排配置正确',
      ),
    })
  }
  return l3MgmtPassthroughClient
}

/** L3 路径前缀：经 mgmt 时为 /v1/data-builder，直连时为 /api/v1/data-builder。 */
export function getL3TasksPathPrefix(): string {
  return useDataBuilderTasksViaMgmt() ? '/v1/data-builder' : '/api/v1/data-builder'
}

export default dataBuilderClient
