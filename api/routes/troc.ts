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
  .post('/:trocId/admin/:userId', ensureUserIsAdmin, addAdmin, resTrocUser)
  .delete('/:trocId/admin/:userId', ensureUserIsAdmin, removeAdmin, resTrocUser)
  .post('/:trocId/cashier/:userId', ensureUserIsAdmin, addCashier, resTrocUser)
  .delete(
    '/:trocId/cashier/:userId',
    ensureUserIsAdmin,
    removeCashier,
    resTrocUser
  )
  .post('/:trocId/trader/:userId', ensureUserIsAdmin, addTrader, resTrocUser)
  .delete(
    '/:trocId/trader/:userId',
    ensureUserIsAdmin,
    removeTrader,
    resTrocUser
  )
  .post(
    '/:trocId/trader/:userId/prefix',
    ensureUserIsAdmin,
    editTraderPrefix,
    resTrocUser
  )

export default router
