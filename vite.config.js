import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow importing from pkg directory
  server: {
    fs: {
      allow: ['..']
    }
  },
  // Handle WASM files
  assetsInclude: ['**/*.wasm'],
})
