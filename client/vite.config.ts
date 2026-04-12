import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/companies': 'http://localhost:3000',
      '/risk-assessment': 'http://localhost:3000',
    },
  },
})
