import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This configures the development server proxy
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your Express backend port
        changeOrigin: true,
        secure: false,
      }
    }
  }
})