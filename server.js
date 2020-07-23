let api = require('./api/server')
let { ssr } = require('@sveltech/ssr')
let express = require('express')
let app = express()
let ENTRYPOINT = 'dist/__app.html'
let APP = 'dist/build/bundle.js'
let { PORT } = process.env
PORT = PORT || 5000

app.use(api)

app.use(express.static('dist'))

app.get('*', async (req, res) => {
    const html = await ssr(ENTRYPOINT, APP, req.url)
    res.send(html)
})

app.listen(PORT, () => console.log(`Server listen on port ${PORT}`))
