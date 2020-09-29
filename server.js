const { TROCIO_PORT } = require('./config.js')
let api = require('./api/server')
let { ssr } = require('@sveltech/ssr')
let express = require('express')
let app = express()
let ENTRYPOINT = 'dist/__app.html'
let APP = 'dist/build/bundle.js'

app.use(api)

app.use(express.static('dist'))

app.get('*', async (req, res) => {
    /*
    const html = await ssr(ENTRYPOINT, APP, req.url)
    res.send(html)
    */
   res.sendFile(ENTRYPOINT, { root: __dirname })
})

app.listen(TROCIO_PORT, () => console.log(`Server listen on port ${TROCIO_PORT}`))
