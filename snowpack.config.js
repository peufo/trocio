/** @type {import('snowpack').SnowpackUserConfig } */
const fs = require('fs')

const { TROCIO_API_PORT } = require('./config.js')
const proxy = require('http2-proxy')

module.exports = {
  mount: {
    static: '/',
    src: '/dist',
    '.routify': '/',
  },
  plugins: [
    '@snowpack/plugin-svelte',
    '@snowpack/plugin-webpack'
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    secure: true,
    output: 'stream'
  },
  buildOptions: {
    /* ... */
  },
  routes: [
    //API Proxy
    {
      src: '/__API__/.*',
      dest: (req, res) => {
        req.url = req.url.replace(/^\/__API__/, '')
        proxy.web(req, res, {hostname: 'localhost', port: TROCIO_API_PORT})
      }
    },
    //SPA Fallback
    {match: 'routes', src: '.*', dest: '/index.html'},
  ],
  alias: {
    '$': './src/components' 
  },
}
