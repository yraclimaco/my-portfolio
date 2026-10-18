import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // three.js is its own lazily loaded chunk for the box intro (about 150 kB gzipped).
  build: { chunkSizeWarningLimit: 650 },
})
