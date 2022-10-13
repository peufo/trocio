import express from 'express'

import { createPayment, getPayments } from '../controllers/payement'
const router = express.Router()

router.get('/', getPayments).post('/', createPayment)

export default router
