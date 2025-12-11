import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'; // Import path module
import { readFileSync } from 'fs'; // Import readFileSync

const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://vitejs.dev/config/
export default defineConfig({
  base: './', // Use relative paths
  plugins: [react()],
  root: 'src/renderer', // Point Vite to the renderer source
  define: {
    'import.meta.env.VITE_APP_NAME': JSON.stringify(packageJson.name),
  },
  build: {
    outDir: '../../dist', // Output to a 'dist' folder at the root
    emptyOutDir: true,
  }
})
