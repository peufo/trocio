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
  getResumePrintData,
} from '../controllers/subscribe_get'
import {
  ensureUserIsCashier,
  ensureUserIsAdmin,
  ensureUserCanAccessResum,
} from '../controllers/subscribe_util'

router
  .post('/', createSubscribe)
  .get('/', ensureUserIsCashier, getSubscribers)
  .get('/count', ensureUserIsCashier, getSubscribersCount)
  .get('/byId', ensureUserCanAccessResum, getSubscribe)
  .get('/resum', ensureUserCanAccessResum, getResum)
  .get('/resum/fulldata', ensureUserCanAccessResum, getResumePrintData)
  .get('/me', getMySubscribes)
  .post('/role', ensureUserIsAdmin, assignRole)
  .post('/tarif', ensureUserIsAdmin, assignTarif)
  .post('/prefix', ensureUserIsAdmin, setTraderPrefix)

export default router
