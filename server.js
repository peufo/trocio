const { TROCIO_FRONT_PORT, TROCIO_API_HOST } = require('./config.js')
const express = require('express')
const app = express()
const logger = require('morgan')
const { createProxyMiddleware } = require('http-proxy-middleware')

// Activation des logs TODO: sorti dans le file system ?
app.use(logger('dev'))

// Création du proxy
app.use('/api', createProxyMiddleware({ pathRewrite: {'^/api': '/'}, target: TROCIO_API_HOST, changeOrigin: true }))

// Sert le build
app.use(express.static('build'))

// Par défault, sert la spa
app.get('*', async (req, res) => {
    res.sendFile('build/index.html', { root: __dirname })
})

// Active le serveur
app.listen(TROCIO_FRONT_PORT, () => console.log(`Server listen on port ${TROCIO_FRONT_PORT}`))
