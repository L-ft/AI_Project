import axios from 'axios'

export interface AppError {
  status: number
  code?: string | number
  message: string
  raw?: unknown
}

export function toAppError(error: unknown): AppError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0
    const data = error.response?.data as Record<string, unknown> | undefined
    return {
      status,
      code: (data?.code as string | number | undefined) ?? undefined,
      message:
        (typeof data?.message === 'string' && data.message) ||
        (typeof data?.detail === 'string' && data.detail) ||
        error.message ||
        '请求失败',
      raw: data
    }
  }

  if (error instanceof Error) {
    return {
      status: 0,
      message: error.message,
      raw: error
    }
  }

  return {
    status: 0,
    message: '请求失败',
    raw: error
  }
}

export function getErrorMessage(error: unknown, fallback = '请求失败'): string {
  const appError = toAppError(error)
  return appError.message || fallback
}

