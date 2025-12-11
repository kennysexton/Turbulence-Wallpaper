import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Use relative paths
  plugins: [react()],
  root: 'src/renderer', // Point Vite to the renderer source
  build: {
    outDir: '../../dist', // Output to a 'dist' folder at the root
    emptyOutDir: true,
  }
})
