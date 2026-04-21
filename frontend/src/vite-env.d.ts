/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MGMT_API_URL?: string
  readonly VITE_EXEC_ENGINE_URL?: string
  readonly VITE_DATA_BUILDER_URL?: string
  /** 默认为 true；L3 任务 API 走 mgmt-api，显式设为 false 时回退直连 exec-engine。 */
  readonly VITE_DATA_BUILDER_VIA_MGMT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
