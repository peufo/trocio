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
  getSubscribersCount,
  getResum,
} from '../controllers/subscribe_get'
import {
  ensureUserIsCashier,
  ensureUserIsAdmin,
  ensureUserCanAccessResum,
} from '../middlewares/troc'

router
  .post('/', createSubscribe)
  .get('/', ensureUserIsCashier, getSubscribers)
  .get('/resum', ensureUserCanAccessResum, getResum)
  .get('/me', getMySubscribes)
  .get('/count', ensureUserIsCashier, getSubscribersCount)
  .post('/assign', ensureUserIsAdmin, assignRole)
  .post('/tarif', ensureUserIsAdmin, assignTarif)
  .post('/prefix', ensureUserIsAdmin, setTraderPrefix)

export default router
