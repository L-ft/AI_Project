import { createHttpClient } from './core/create-client'
import { message } from '../utils/naive-api'

function getExecEngineBaseURL(): string {
  const fromEnv = import.meta.env.VITE_EXEC_ENGINE_URL as string | undefined
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  return import.meta.env.DEV ? '/engine' : '/engine'
}

const execRequest = createHttpClient({
  baseURL: getExecEngineBaseURL(),
  timeout: 30000,
  unwrapResponse: (response) => {
    const res = response.data as { code?: number | string; data?: unknown; msg?: string }
    // 后端 ResponseModel 的 code 一般为数字 200；若被序列化成字符串 "200"，严格 === 会失败，
    // 导致整包 { code, data, msg } 原样返回，body_definition 落在 res.data 里，前端拿不到
    const code = res?.code
    const codeOk = code === undefined || code === null || Number(code) === 200
    if (res && typeof res === 'object' && 'data' in res && codeOk) {
      return res.data
    }
    return res
  },
  onError: (error, appError) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message.error('Request timed out, please try again later')
      return
    }

    if (error.code === 'ERR_NETWORK' || !error.response) {
      message.error('Execution engine connection failed')
      return
    }

    const status = appError.status
    if (status === 409) {
      return
    }

    if (status === 502) {
      message.error(
        'Execution engine is unavailable (502). Please confirm exec_engine is running and /health is reachable.'
      )
      return
    }

    message.error(`Request failed (${status})${appError.message ? `: ${appError.message}` : ''}`)
  }
})

export default execRequest
