import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages用のbaseパス設定（環境変数で制御）
  base: process.env.VITE_BASE_PATH || '/',
  root: resolve(__dirname, '..'),
  worker: {
    format: 'es'
  }
})