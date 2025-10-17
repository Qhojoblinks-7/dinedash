import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

  ],
  server: {
    // Proxy /api requests to the Django backend during development
    proxy: {
      '/api': {
        target: 'https://dinedash-2-lh2q.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
