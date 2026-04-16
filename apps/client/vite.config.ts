import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: resolve(__dirname, '../..'),
  resolve: {
    alias: {
      '@': resolve(__dirname, '../..'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/companies': 'http://localhost:3000',
      '/risk-assessment': 'http://localhost:3000',
    },
  },
})
