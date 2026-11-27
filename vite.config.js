import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'
import { mdsvex } from 'mdsvex'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte({
      extensions: ['.svelte', '.md'],
      preprocess: [
        mdsvex({ extension: '.md', rehypePlugins: [headingAnchors] }),
        sveltePreprocess({
          scss: {
            includePaths: ['src/theme'],
          },
        }),
      ],
    }),
  ],
  clearScreen: false,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      $lib: '/src/lib',
      $assets: '/src/assets',
      $material: '/src/material',
    },
  },
  optimizeDeps: {
    exclude: ['@roxi/routify', '@sveltestack/svelte-query'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
    https: process.env.DEV_HTTPS ? devCerts() : false,
  },
})

/**
 * Plugin rehype : donne un id aux titres h2/h3 des fichiers Markdown et
 * rend le titre cliquable vers sa propre ancre.
 * "5. Protection et sécurité des données" -> #protection-et-securite-des-donnees
 */
function headingAnchors() {
  const textOf = (node) =>
    node.type === 'text' ? node.value : (node.children || []).map(textOf).join('')

  const slugify = (text) =>
    text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/^\s*\d+\.\s*/, '')
      .replace(/[’']/g, '-')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const visit = (node) => {
    if (node.type === 'element' && ['h2', 'h3'].includes(node.tagName)) {
      const id = slugify(textOf(node))
      node.properties = { ...node.properties, id }
      node.children = [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: `#${id}`, className: ['anchor'] },
          children: node.children,
        },
      ]
      return
    }
    ;(node.children || []).forEach(visit)
  }

  return (tree) => visit(tree)
}

/**
 * HTTPS opt-in (DEV_HTTPS=1, cf. `npm run dev-https`) : seulement utile pour
 * scanner avec la caméra d'un téléphone via l'IP locale. Sur localhost, la
 * caméra marche en HTTP.
 */
function devCerts() {
  const key = 'localhost-key.pem'
  const cert = 'localhost.pem'
  if (!fs.existsSync(key) || !fs.existsSync(cert)) {
    throw new Error('DEV_HTTPS : certificats absents, lance `npm run certs`')
  }
  return { key: fs.readFileSync(key), cert: fs.readFileSync(cert) }
}
