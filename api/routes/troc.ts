import express from 'express'
const router = express.Router()

import {
  getStats,
  search,
  getTroc,
  getTrocCounter,
} from '../controllers/troc_get'
import {
  createTroc,
  patchTroc,
  editTraderPrefix,
  createTarif,
  deleteTarif,
  editTarif,
  addApply,
  removeApply,
} from '../controllers/troc_set'
// import { checkAdmin } from '../controllers/troc_utils'
import { ensureUserIsAdmin } from '../controllers/subscribe_util'

import { resTrocUser } from '../res/troc'

router
  .get('/', search)
  .post('/', createTroc)
  .post('/tarif', ensureUserIsAdmin, createTarif)
  .delete('/tarif', ensureUserIsAdmin, deleteTarif)
  .patch('/tarif', ensureUserIsAdmin, editTarif)
  .get('/byId', getTroc)
  .get('/byId/counters', getTrocCounter)

  /** TODO: not use params */
  .patch('/:trocId', ensureUserIsAdmin, patchTroc)
  .get('/:trocId/stats', ensureUserIsAdmin, getStats)

  .post(
    '/:trocId/trader/:userId/prefix',
    ensureUserIsAdmin,
    editTraderPrefix,
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
