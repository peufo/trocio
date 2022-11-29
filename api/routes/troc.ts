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
  createTarif,
  deleteTarif,
  editTarif,
} from '../controllers/troc_set'
import { ensureUserIsAdmin } from '../controllers/access'

router
  .get('/', search)
  .post('/', createTroc)
  .post('/tarif', ensureUserIsAdmin, createTarif)
  .delete('/tarif', ensureUserIsAdmin, deleteTarif)
  .patch('/tarif', ensureUserIsAdmin, editTarif)
  .get('/byId', getTroc)
  .get('/byId/counters', getTrocCounter)
  .get('/byId/stats', ensureUserIsAdmin, getStats)

  /** TODO: not use params */
  .patch('/:trocId', ensureUserIsAdmin, patchTroc)

export default router
