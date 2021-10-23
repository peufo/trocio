import express from 'express'
const router = express.Router()
import {
  createSubscribe,
  assignRole,
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
  .get('/count', ensureUserIsCashier, getSubscribersCount)
  .post('/assign', ensureUserIsAdmin, assignRole)
  .post('/prefix', ensureUserIsAdmin, setTraderPrefix)
  .get('/me', getMySubscribes)
  .get('/resum', ensureUserCanAccessResum, getResum)

export default router
