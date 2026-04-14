import { createHttpClient } from './core/create-client'
import { message } from '../utils/naive-api'
import { type AppError } from './core/errors'

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

const dataBuilderClient = createHttpClient({
  baseURL: getDataBuilderBaseURL(),
  timeout: 120_000,
  unwrapResponse: (response) => response.data,
  onError: (error, appError: AppError) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message.error('数据构建服务请求超时，请稍后重试')
      return
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
      message.error('无法连接数据构建服务，请确认 data-builder 已启动且网关 /data-builder 可用')
      return
    }
    const status = appError.status
    if (status === 401 || status === 403) {
      message.error(appError.message || '无权限访问数据构建服务')
      return
    }
    if (status === 502) {
      message.error('数据构建服务不可用 (502)，请检查上游与 Nginx 配置')
      return
    }
    const body = error.response?.data
    const extra = detailFromAxiosData(body)
    message.error(
      extra ? `${appError.message || '请求失败'}：${extra}` : appError.message || '请求失败'
    )
  }
})

export default dataBuilderClient
