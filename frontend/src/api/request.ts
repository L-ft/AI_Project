import axios from 'axios'
import { message } from '../utils/naive-api'

function getMgmtApiBaseURL(): string {
  const fromEnv = import.meta.env.VITE_MGMT_API_URL as string | undefined
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  // 生产默认 /api（需 Nginx 反代）；直连调试可设 VITE_MGMT_API_URL=http://host:3011
  return import.meta.env.DEV ? 'http://localhost:3011' : '/api'
}

const request = axios.create({
  baseURL: getMgmtApiBaseURL(),
  timeout: 10000
})

// 请求拦截器：自动注入 Token
request.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一处理错误
let isRedirecting = false // 增加重定向锁，防止重复触发跳转

request.interceptors.response.use(
  (response) => {
    const res = response.data
    // 适配标准成功结构：直接返回 data 部分
    if (res.code >= 200 && res.code < 300) {
      return res.data
    }
    // 处理 NestJS 标准错误响应
    if (response.status === 200 || response.status === 201) {
      return res
    }
    return res
  },
  (error) => {
    const status = error.response?.status
    const data = error.response?.data
    const msg = data?.message || '网络连接异常'
    
    // 获取发起请求时的 Token
    const authHeader = error.config?.headers?.Authorization || error.config?.headers?.authorization
    const configToken = typeof authHeader === 'string' ? authHeader.replace('Bearer ', '') : null
    const currentToken = localStorage.getItem('token')

    // 强制下线判定：401 或 带有特定标识的 403
    const isAuthExpired = status === 401 || (status === 403 && typeof msg === 'string' && msg.includes('AUTH_SESSION_EXPIRED'))

    if (isAuthExpired) {
      // 只有当报错的 Token 确实是当前正在使用的 Token 时，才执行下线
      // 这样可以避免旧请求返回的 403 错误误杀了用户刚刚登录的新会话
      if (configToken === currentToken || !configToken) {
        if (!isRedirecting) {
          isRedirecting = true
          
          // 立即清除所有本地身份缓存
          localStorage.clear()
          
          const displayMsg = typeof msg === 'string' ? msg.replace('AUTH_SESSION_EXPIRED:', '') : '账号信息已变更，请重新登录'
          message.error(displayMsg)

          setTimeout(() => {
            isRedirecting = false
            window.location.href = '/login'
          }, 1200)
        }
        return Promise.reject(error)
      } else {
        console.warn('[Request] 忽略旧 Token 产生的 403 错误')
        return Promise.reject(error)
      }
    } else if (status === 403) {
      // 普通权限拒绝
      const displayMsg = typeof msg === 'string' ? msg.replace('AUTH_PERMISSION_DENIED:', '') : '权限不足'
      message.error(displayMsg)
    } else {
      message.error(typeof msg === 'string' ? msg : '请求失败')
    }
    
    return Promise.reject(error)
  }
)

export default request
