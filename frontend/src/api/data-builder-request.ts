/**
 * LLM 数据构建服务（独立子项目）。
 * 生产环境经 Nginx：/data-builder → data_builder_final:8000（去掉前缀）。
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
