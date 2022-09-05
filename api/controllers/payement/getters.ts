import { RequestHandler } from 'express'
import mongoose from 'mongoose'

import { IPaymentCreate } from '../../../types'
import Payment from '../../models/payment'
import Subscribe from '../../models/subscribe'

export const getPaymentByUser: RequestHandler = async (req, res, next) => {
  try {
    const { userSubId } = req.query

    if (!req.session.user) throw 'Login required !'
    if (!userSubId) throw 'userSubId is required'

    const acceded = await Subscribe.findById(userSubId)
    if (!acceded) throw 'acceded not found'

    const accesor = await Subscribe.findOne({
      userId: req.session.user._id,
      trocId: acceded.trocId,
    })
    if (!accesor) throw 'accesor not found'
    if (
      accesor._id.valueOf() !== userSubId &&
      accesor.role !== 'admin' &&
      accesor.role !== 'cashier'
    )
      throw 'Not allowed'

    const payments = await Payment.find({
      userSubId,
    })

    res.json(payments)
  } catch (error) {
    next(error)
  }
}
