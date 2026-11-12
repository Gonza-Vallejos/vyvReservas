import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// ============================================================================
// MODO NUBE / ORIGINAL (ACTIVO)
// Configuración estándar de Vite para despliegue en la nube (Vercel, producción, etc.)
// ============================================================================
export default defineConfig({
  plugins: [react()],
})

// ============================================================================
// MODO LOCAL CON BACKEND EN LA NUBE (COMENTADO)
// Si quieres levantar el front de forma local (npm run dev) conectándote al
// backend de Render, descomenta el siguiente bloque y comenta el export default de arriba.
// Esto activa el proxy local para evitar problemas de CORS en el navegador.
// ============================================================================
/*
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
*/
