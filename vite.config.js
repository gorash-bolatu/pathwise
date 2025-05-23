import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '172.19.1.37',       // Accept connections from any IP
    port: 5173             // Or any other port you prefer
  }
})
