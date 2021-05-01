import { defineConfig } from 'vite'
import svelte from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  clearScreen: false,
  resolve: {
    alias: {
      $lib: '/src/lib',
      $assets: '/src/assets',
    },
  },
  optimizeDeps: {
    exclude: ['@roxi/routify'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
