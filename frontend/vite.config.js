import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  // On Vercel, the API base is /_/backend/api (set via VITE_API_BASE env var)
  define: {
    __VERCEL_ENV__: process.env.VERCEL === '1'
  }
})