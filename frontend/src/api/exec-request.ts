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
    const res = response.data as { code?: number; data?: unknown }
    if (res?.code === 200) {
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
