/** @type {import('snowpack').SnowpackUserConfig } */

const { TROCIO_API_HOST } = require('./config.js')
const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = {
  mount: {
    static: '/',
    src: '/dist',
    '.routify': '/',
  },
  plugins: [
    '@snowpack/plugin-svelte',
    ['@snowpack/plugin-webpack', {
      sourceMap: true
    }]
  ],
  packageOptions: {
    //For use sveltematerialui
    rollup: {
      plugins: [
        require('rollup-plugin-svelte')({
          include: ['./node_modules'],
        }),
        require('rollup-plugin-postcss')({
          use: [['sass', {includePaths: ['./src/theme', './node_modules']}]],
        }),
      ],
    },
    knownEntrypoints: [
      /* ... */
    ]
  },
  devOptions: {
    secure: false,
    fallback: './build/index.html',
    output: 'stream'
  },
  buildOptions: {
    /* ... */
  },
  routes: [
    //API Proxy
    {src: '/__API__/.*', dest: createProxyMiddleware({pathRewrite: {'^/__API__': '/'}, target: TROCIO_API_HOST, changeOrigin: true})},
    //SPA Fallback
    {match: 'routes', src: '.*', dest: '/index.html'},
  ],
  alias: {
    '$': './src/components' 
  },
}
