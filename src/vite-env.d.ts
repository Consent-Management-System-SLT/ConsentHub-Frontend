/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_TMF669_API_URL: string
  readonly VITE_TMF632_API_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_KAFKA_BROKERS: string
  readonly VITE_AZURE_EVENT_GRID_ENDPOINT: string
  readonly VITE_AZURE_EVENT_GRID_ACCESS_KEY: string
  readonly VITE_RABBITMQ_CONNECTION_STRING: string
  readonly NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
