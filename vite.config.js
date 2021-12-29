import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import { mdsvex } from 'mdsvex'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      extensions: ['.svelte', '.md'],
      preprocess: [
        mdsvex({ extension: '.md' }),
        sveltePreprocess({
          scss: {
            includePaths: ['src/theme'],
          },
        }),
      ],
    }),
  ],
  clearScreen: false,
  resolve: {
    alias: {
      $lib: '/src/lib',
      $assets: '/src/assets',
    },
  },
  optimizeDeps: {
    include: ['detect-node'],
    exclude: ['@roxi/routify', '@sveltestack/svelte-query'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    https: {
      key: readIfExists('localhost-key.pem'),
      cert: readIfExists('localhost.pem'),
    },
  },
})

function readIfExists(path) {
  return fs.existsSync(path) ? fs.readFileSync(path) : ''
}
