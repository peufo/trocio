import express from 'express'
const router = express.Router()

import { getSpec, getStats, search, getTroc } from '../controllers/troc_get'
import {
  createTroc,
  patchTroc,
  addAdmin,
  addCashier,
  addTrader,
  removeAdmin,
  removeCashier,
  removeTrader,
  editTraderPrefix,
} from '../controllers/troc_set'
// import { checkAdmin } from '../controllers/troc_utils'
import {
  ensureUserIsAdmin,
  ensureUserCanAccessResum,
} from '../middlewares/troc'

import { resUserResume, resTrocUser } from '../res/troc'

router
  .get('/', search)
  .post('/', createTroc)
  .patch('/:trocId', ensureUserIsAdmin, patchTroc)
  .get('/resum', ensureUserCanAccessResum, resUserResume)
  .get('/spec', getSpec)
  .get('/:trocId/stats', ensureUserIsAdmin, getStats)
  .get('/:trocId', getTroc)
  .post('/:trocId/admin', ensureUserIsAdmin, addAdmin, resTrocUser)
  .post('/:trocId/cashier', ensureUserIsAdmin, addCashier, resTrocUser)
  .post('/:trocId/trader', ensureUserIsAdmin, addTrader, resTrocUser)
  .post('/:trocId/admin/remove', ensureUserIsAdmin, removeAdmin, resTrocUser)
  .post(
    '/:trocId/cashier/remove',
    ensureUserIsAdmin,
    removeCashier,
    resTrocUser
  )
  .post('/:trocId/trader/remove', ensureUserIsAdmin, removeTrader, resTrocUser)
  .post(
    '/:trocId/trader/prefix',
    ensureUserIsAdmin,
    editTraderPrefix,
    resTrocUser
  )

export default router
