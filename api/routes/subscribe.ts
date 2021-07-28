import express from 'express'
const router = express.Router()
import { createSubscribe } from '../controllers/subscribe_set'
import {
  getMySubscribedTrocs,
  getSubscriber,
} from '../controllers/subscribe_get'
import { checkAdmin } from '../controllers/troc_utils'

router
  .post('/', createSubscribe)
  .get('/', checkAdmin, getSubscriber)
  .get('/me', getMySubscribedTrocs)

export default router
