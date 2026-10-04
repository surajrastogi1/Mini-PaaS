import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(),tailwindcss(),],
    server: {
      host: 'localhost',
      port: 3000,
      strictPort: true,
      proxy: {
        '/auth': {
          target: env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:8000',
          changeOrigin: true,
          bypass(request) {
            if (/^\/auth\/callback\/(google|github)(\?|$)/.test(request.url || '')) return request.url
          },
        },
      },
    },
  }
})
