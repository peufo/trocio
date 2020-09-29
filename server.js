const { TROCIO_FRONT_PORT, TROCIO_API_HOST } = require('./config.js')
const express = require('express')
const app = express()
const logger = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware')
//const ENTRYPOINT = 'dist/__app.html'
//const APP = 'dist/build/bundle.js'

app.use(logger('dev'))

app.use('/api', createProxyMiddleware({ pathRewrite: {'^/api': '/'}, target: TROCIO_API_HOST, changeOrigin: true }))

app.use(express.static('dist'))

app.get('*', async (req, res) => {
    /* const { ssr } = require('@sveltech/ssr')
    const html = await ssr(ENTRYPOINT, APP, req.url)
    res.send(html)
    */
    res.sendFile(ENTRYPOINT, { root: __dirname })
})

app.listen(TROCIO_FRONT_PORT, () => console.log(`Server listen on port ${TROCIO_FRONT_PORT}`))
