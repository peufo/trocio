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

import { resUserResume } from '../res/troc'

router
  .get('/', search)
  .get('/resum', ensureUserCanAccessResum, resUserResume)
  .get('/spec', getSpec)
  .get('/:trocId/stats', ensureUserIsAdmin, getStats)
  .get('/:trocId', getTroc)
  .post('/', createTroc)
  .patch('/:trocId', ensureUserIsAdmin, patchTroc)
  .post('/:trocId/admin', ensureUserIsAdmin, addAdmin)
  .post('/:trocId/cashier', ensureUserIsAdmin, addCashier)
  .post('/:trocId/trader', ensureUserIsAdmin, addTrader)
  .post('/:trocId/admin/remove', ensureUserIsAdmin, removeAdmin)
  .post('/:trocId/cashier/remove', ensureUserIsAdmin, removeCashier)
  .post('/:trocId/trader/remove', ensureUserIsAdmin, removeTrader)
  .post('/:trocId/trader/prefix', ensureUserIsAdmin, editTraderPrefix)

export default router
