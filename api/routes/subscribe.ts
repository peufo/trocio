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
  getResumCounts,
  getResumePrintData,
} from '../controllers/subscribe_get'
import {
  ensureUserIsCashier,
  ensureUserIsAdmin,
  ensureUserCanAccessResum,
} from '../controllers/access'

router
  .post('/', createSubscribe)
  .get('/', ensureUserIsCashier, getSubscribers)
  .get('/count', ensureUserIsCashier, getSubscribersCount)
  .get('/byId', ensureUserCanAccessResum, getSubscribe)
  .get('/resum', ensureUserCanAccessResum, getResum)
  .get('/resum/counts', ensureUserCanAccessResum, getResumCounts)
  .get('/resum/fulldata', ensureUserCanAccessResum, getResumePrintData)
  .get('/me', getMySubscribes)
  .post('/role', ensureUserIsAdmin, assignRole)
  .post('/tarif', ensureUserIsAdmin, assignTarif)
  .post('/prefix', ensureUserIsAdmin, setTraderPrefix)

export default router
