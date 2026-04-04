import axios from 'axios'
import { message } from '../utils/naive-api'

/** 开发：Vite 代理 /engine；生产：可设 VITE_EXEC_ENGINE_URL（如 /engine 同域反代） */
function getExecEngineBaseURL(): string {
  const fromEnv = import.meta.env.VITE_EXEC_ENGINE_URL as string | undefined
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  if (import.meta.env.DEV) return '/engine'
  // 生产默认走同源 /engine（需 Nginx 反代）；本地直连调试可设 VITE_EXEC_ENGINE_URL=http://localhost:8010
  return '/engine'
}

const execRequest = axios.create({
  baseURL: getExecEngineBaseURL(),
  timeout: 30000
})

execRequest.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code === 200) {
      return res.data
    }
    return res
  },
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      message.error('请求超时，请稍后重试')
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
      message.error('执行引擎连接失败')
    } else {
      const status = error.response?.status
      const detail = error.response?.data?.detail || error.response?.data?.message || ''
      if (status === 502) {
        message.error(
          '执行引擎不可用（502）。请确认 Docker 中 exec_engine 已启动：docker compose ps；本机可访问 http://127.0.0.1:8010/health 后再试。'
        )
      } else {
        message.error(`请求失败 (${status})${detail ? '：' + detail : ''}`)
      }
    }
    return Promise.reject(error)
  }
)

export default execRequest
