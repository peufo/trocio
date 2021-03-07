const { TROCIO_FRONT_PORT, TROCIO_API_HOST } = require('./config.js')
const express = require('express')
const app = express()
const logger = require('morgan')
const api = require('./api/app.js')

// Activation des logs TODO: sorti dans le file system ?
app.use(logger('dev'))

// Instancation de l'API
//TODO: FIX
app.use('/__API__', api)

// Sert le build
app.use(express.static('./build'))

// Par défault, sert la spa
app.get('*', (req, res) => {
    res.sendFile(`${__dirname}/build/index.html`)
})

app.listen(TROCIO_FRONT_PORT, err => {
    if (err) return console.log(err)
    console.log(`Server listen on port ${TROCIO_FRONT_PORT}`)
})
