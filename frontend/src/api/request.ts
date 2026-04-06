import { createHttpClient } from './core/create-client'
import { type AppError } from './core/errors'
import { message } from '../utils/naive-api'

function getMgmtApiBaseURL(): string {
  const fromEnv = import.meta.env.VITE_MGMT_API_URL as string | undefined
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  return import.meta.env.DEV ? 'http://localhost:3011' : '/api'
}

let isRedirecting = false

function isAuthExpired(status: number, appError: AppError): boolean {
  return status === 401 || (status === 403 && appError.message.includes('AUTH_SESSION_EXPIRED'))
}

const request = createHttpClient({
  baseURL: getMgmtApiBaseURL(),
  timeout: 10000,
  unwrapResponse: (response) => {
    const res = response.data as { code?: number; data?: unknown }
    if (typeof res?.code === 'number' && res.code >= 200 && res.code < 300) {
      return res.data
    }
    if (response.status === 200 || response.status === 201) {
      return res
    }
    return res
  },
  onError: (error, appError) => {
    const status = appError.status
    const authHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization
    const configToken = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null
    const currentToken = localStorage.getItem('token')

    if (isAuthExpired(status, appError)) {
      if (configToken === currentToken || !configToken) {
        if (!isRedirecting) {
          isRedirecting = true
          localStorage.clear()
          message.error(appError.message.replace('AUTH_SESSION_EXPIRED:', '') || 'Please sign in again')
          setTimeout(() => {
            isRedirecting = false
            window.location.href = '/login'
          }, 1200)
        }
      }
      return
    }

    if (status === 403) {
      message.error(appError.message.replace('AUTH_PERMISSION_DENIED:', '') || 'Permission denied')
      return
    }

    message.error(appError.message || 'Request failed')
  }
})

export default request
