const { TROCIO_PORT } = require('./config.js')
const express = require('express')
const app = express()
const logger = require('morgan')
const api = require('./api/app.js')

// Activation des logs TODO: sorti dans le file system ?
app.use(logger('dev'))

// Sert l'API
app.use('/api', api)

// Sert le build
app.use(express.static('./dist'))

// Par défault, sert la SPA
app.get('*', (req, res) => {
  res.sendFile(`${__dirname}/dist/index.html`)
})

app.listen(TROCIO_PORT, (err) => {
  if (err) return console.log(err)
  console.log(`Server listen on port ${TROCIO_PORT}`)
})
