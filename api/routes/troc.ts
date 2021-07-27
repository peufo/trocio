import express from 'express'
const router = express.Router()

import { getSpec, getStats, search, getTroc } from '../controllers/troc_get'
const {
  createTroc,
  patchTroc,
  addAdmin,
  addCashier,
  addTrader,
  removeAdmin,
  removeCashier,
  removeTrader,
  editTraderPrefix,
} = require('../controllers/troc_set').default

// import { checkAdmin } from '../controllers/troc_utils'
import { ensureUserCanAccessResum } from '../middlewares/troc'

import { resUserResume } from '../res/troc'

router.get('/resum', ensureUserCanAccessResum, resUserResume).get('/', search)
/*
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
  */

export default router
