import express from 'express'

import {
  createPayment,
  getPayments,
  getPaymentsResum,
} from '../controllers/payement'
const router = express.Router()

router.get('/resum', getPaymentsResum)
router.get('/', getPayments).post('/', createPayment)

export default router
