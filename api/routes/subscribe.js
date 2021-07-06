const express = require('express')
const router = express.Router()
const { createSubscribe } = require('../controllers/subscribe_set')
const {
  getMySubscribedTrocs,
  getSubscriber,
} = require('../controllers/subscribe_get')
const { checkAdmin } = require('../controllers/troc_utils')

router
  .post('/', createSubscribe)
  .get('/me', getMySubscribedTrocs)
  .get('/', checkAdmin, getSubscriber)

module.exports = router
