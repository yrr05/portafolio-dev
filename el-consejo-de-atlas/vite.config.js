import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_HOST = process.env.VITE_API_HOST || 'localhost'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api/usuarios':   { target: `http://${API_HOST}:3001`, rewrite: p => p.replace('/api/usuarios', ''), changeOrigin: true },
      '/api/rutinas':    { target: `http://${API_HOST}:3002`, rewrite: p => p.replace('/api/rutinas', ''), changeOrigin: true },
      '/api/ejercicios': { target: `http://${API_HOST}:3003`, rewrite: p => p.replace('/api/ejercicios', ''), changeOrigin: true },
      '/api/clases':     { target: `http://${API_HOST}:3004`, rewrite: p => p.replace('/api/clases', ''), changeOrigin: true },
      '/api/eventos':    { target: `http://${API_HOST}:3005`, rewrite: p => p.replace('/api/eventos', ''), changeOrigin: true },
    }
  }
})
