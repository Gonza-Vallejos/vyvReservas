import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const rawApiUrl = env.VITE_API_URL || 'https://vyvreservas-api.onrender.com'

  let target = 'https://vyvreservas-api.onrender.com'
  try {
    const url = new URL(rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`)
    target = url.origin
  } catch {
    target = 'https://vyvreservas-api.onrender.com'
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
