let express = require('express')
let router = express.Router()
let { createSubscribe } = require('../controllers/subscribe')

router.post('/', createSubscribe)

module.exports = router
