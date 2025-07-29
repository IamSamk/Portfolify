import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // For GitHub Pages deployment
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable sourcemaps for production
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          react: ['react', 'react-dom'],
          excalidraw: ['@excalidraw/excalidraw'],
          transformers: ['@xenova/transformers']
        }
      }
    }
  },
  // Optimize for GitHub Pages
  optimizeDeps: {
    include: ['@xenova/transformers']
  }
})
