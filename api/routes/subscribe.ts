import express from 'express'
const router = express.Router()
import {
  createSubscribe,
  assignRole,
  assignTarif,
  setTraderPrefix,
} from '../controllers/subscribe_set'
import {
  getMySubscribes,
  getSubscribers,
  getSubscribe,
  getSubscribersCount,
  getResum,
} from '../controllers/subscribe_get'
import {
  ensureUserIsCashier,
  ensureUserIsAdmin,
  ensureUserCanAccessResum,
} from '../controllers/subscribe_util'

router
  .post('/', createSubscribe)
  .get('/', ensureUserIsCashier, getSubscribers)
  .get('/byId', ensureUserIsCashier, getSubscribe)
  .get('/count', ensureUserIsCashier, getSubscribersCount)
  .get('/resum', ensureUserCanAccessResum, getResum)
  .get('/me', getMySubscribes)
  .post('/role', ensureUserIsAdmin, assignRole)
  .post('/tarif', ensureUserIsAdmin, assignTarif)
  .post('/prefix', ensureUserIsAdmin, setTraderPrefix)

export default router
