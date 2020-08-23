let express = require('express')
let router = express.Router()
let { createSubscribe } = require('../controllers/subscribe_set')
let { getMySubscribedTrocs } = require('../controllers/subscribe_get')

router
    .post('/', createSubscribe)
    .get('/me', getMySubscribedTrocs)

module.exports = router
