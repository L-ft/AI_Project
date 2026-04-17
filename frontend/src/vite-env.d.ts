/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MGMT_API_URL?: string
  readonly VITE_EXEC_ENGINE_URL?: string
  readonly VITE_DATA_BUILDER_URL?: string
  /** 为 true 时 L3 任务 API 走 mgmt-api 代理（/api/v1/data-builder → exec-engine），路径为 /v1/data-builder/* */
  readonly VITE_DATA_BUILDER_VIA_MGMT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
