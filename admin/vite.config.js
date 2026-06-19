import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: path.resolve(__dirname, '..'),
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Don't pre-bundle the local workspace package, otherwise Vite serves a cached
  // copy and edits to shared services don't hot-reload until the cache is cleared.
  optimizeDeps: {
    exclude: ['@bhatbhati/shared'],
    // ...but crypto-js (a CommonJS dep of the shared package) must still be
    // pre-bundled to ESM, or the browser gets raw CJS and the import fails.
    include: ['crypto-js'],
  },
  server: {
    port: 5174,
  },
})
