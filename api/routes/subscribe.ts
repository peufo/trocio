import express from 'express'
const router = express.Router()
import { createSubscribe } from '../controllers/subscribe_set'
import {
  getMySubscribes,
  getSubscriber,
  getResum,
} from '../controllers/subscribe_get'
import {
  ensureUserIsCashier,
  ensureUserCanAccessResum,
} from '../middlewares/troc'

router
  .post('/', createSubscribe)
  .get('/', ensureUserIsCashier, getSubscriber)
  .get('/me', getMySubscribes)
  .get('/resum', ensureUserCanAccessResum, getResum)

export default router
