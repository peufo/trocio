import express from 'express'

import { createPayment, getPaymentByUser } from '../controllers/payment'
const router = express.Router()

router.get('/by-user', getPaymentByUser).post('/', createPayment)

export default router
