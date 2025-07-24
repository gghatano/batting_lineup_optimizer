import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/batting-lineup-optimizer/' : '/',
  root: resolve(__dirname, '..'),
  worker: {
    format: 'es'
  }
})