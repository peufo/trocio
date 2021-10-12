import express from 'express'
const router = express.Router()
import { createSubscribe } from '../controllers/subscribe_set'
import { getMySubscribes, getSubscriber } from '../controllers/subscribe_get'
import { ensureUserIsCashier } from '../middlewares/troc'

router
  .post('/', createSubscribe)
  .get('/', ensureUserIsCashier, getSubscriber)
  .get('/me', getMySubscribes)

export default router
