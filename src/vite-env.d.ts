/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_MODE: 'local' | 'remote'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}