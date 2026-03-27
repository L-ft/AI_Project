/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_MGMT_API_URL?: string
  readonly VITE_EXEC_ENGINE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
