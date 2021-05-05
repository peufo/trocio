const app = require('./app.js')
const { TROCIO_API_PORT } = require('../config.js')

app.listen(TROCIO_API_PORT, () =>
  console.log(`API listen on port ${TROCIO_API_PORT}`)
)
