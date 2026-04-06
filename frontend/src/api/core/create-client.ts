import axios, { type AxiosError, type AxiosInstance, type AxiosResponse } from 'axios'

import { type AppError, toAppError } from './errors'

type UnwrapResponse = (response: AxiosResponse) => unknown
type ErrorHandler = (error: AxiosError, appError: AppError) => void

interface CreateHttpClientOptions {
  baseURL: string
  timeout: number
  unwrapResponse: UnwrapResponse
  onError: ErrorHandler
}

export function createHttpClient(options: CreateHttpClientOptions): AxiosInstance {
  const client = axios.create({
    baseURL: options.baseURL,
    timeout: options.timeout
  })

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => options.unwrapResponse(response),
    (error) => {
      const appError = toAppError(error)
      options.onError(error, appError)
      return Promise.reject(error)
    }
  )

  return client
}
