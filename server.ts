import path from 'path'
import express from 'express'
import logger from 'morgan'

import config from './config'
import api from './api/app'

const app = express()

// Activation des logs
// TODO: sorti dans le file system ?
app.use(logger('dev'))

// Sert l'API
app.use('/api', api)

// Sert le build
app.use(express.static('./dist'))

// Par défault, sert la SPA
app.get('*', (req, res) => {
  res.sendFile(path.resolve('./dist/index.html'))
})

app.listen(config.TROCIO_PORT, () => {
  console.log(`Server listen on port ${config.TROCIO_PORT}`)
})
