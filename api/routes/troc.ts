import express from 'express'
const router = express.Router()

import { getStats, search, getTroc } from '../controllers/troc_get'
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
  createTarif,
  deleteTarif,
  editTarif,
  addApply,
  removeApply,
} from '../controllers/troc_set'
// import { checkAdmin } from '../controllers/troc_utils'
import { ensureUserIsAdmin } from '../middlewares/troc'

import { resTrocUser } from '../res/troc'

router
  .get('/', search)
  .post('/', createTroc)
  .patch('/:trocId', ensureUserIsAdmin, patchTroc)

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
  .post('/:trocId/tarif', ensureUserIsAdmin, createTarif, resTrocUser)
  .patch('/:trocId/tarif/:tarifId', ensureUserIsAdmin, editTarif, resTrocUser)
  .delete(
    '/:trocId/tarif/:tarifId',
    ensureUserIsAdmin,
    deleteTarif,
    resTrocUser
  )
  .post(
    '/:trocId/tarif/:tarifId/apply/:userId',
    ensureUserIsAdmin,
    addApply,
    resTrocUser
  )
  .delete(
    '/:trocId/tarif/:tarifId/apply/:userId',
    ensureUserIsAdmin,
    removeApply,
    resTrocUser
  )

export default router
