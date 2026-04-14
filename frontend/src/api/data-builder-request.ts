/**
 * 智能造数 API（已并入执行引擎，与 /engine 同源）。
 * 生产环境经 Nginx：/data-builder → exec_engine_final:8000（去掉前缀）。
 */
export function dataBuilderBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_DATA_BUILDER_URL as string | undefined
  const raw = (fromEnv && fromEnv.trim()) ? fromEnv.trim() : '/data-builder'
  return raw.replace(/\/$/, '')
}

export function dataBuilderUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return `${dataBuilderBaseUrl()}${p}`
}
