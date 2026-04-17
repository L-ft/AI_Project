/** 与主站 request 客户端同源，避免循环依赖时单独抽出。 */
export function getMgmtApiBaseURL(): string {
  const fromEnv = import.meta.env.VITE_MGMT_API_URL as string | undefined
  if (fromEnv != null && String(fromEnv).trim() !== '') {
    return String(fromEnv).trim().replace(/\/$/, '')
  }
  return import.meta.env.DEV ? 'http://localhost:3011' : '/api'
}
