import express from 'express'
import Payment from '../models/payment'
import Troc from '../models/troc'
const router = express.Router()

router
  .get('/', (req, res, next) => {
    //TODO: Check if admin, cashier or simple user
    let { user, acceptor, troc } = req.query
    let userQuery: typeof user | { $exists: boolean } = user

    if (!user || !troc) return next(Error('Query troc and user is required !'))

    //For anonyme user
    if (user === 'false' || user === 'undefined') {
      userQuery = { $exists: false }
      if (!acceptor) acceptor = req.session.user?._id
    }

    const query = acceptor ? { user, acceptor, troc } : { user, troc }

    Payment.find(query)
      .sort({ updatedAt: -1 })
      .exec((err, payments) => {
        if (err) return next(err)
        res.json(payments)
      })
  })
  .post('/', (req, res, next) => {
    if (!req.session.user) return next(Error('Login required !'))

    Troc.findOne(
      { _id: req.body.troc },
      { admin: 1, cashier: 1 },
      {},
      (err, troc) => {
        if (err || !troc) return next(err || Error('Troc not found !'))

        //Contrôle le droit de fair un payment (admin ou caissier)
        if (
          !troc.admin.includes(req.session.user._id) &&
          !troc.cashier.includes(req.session.user._id)
        ) {
          return next(
            Error(`you are not allowed to make a payment on this troc`)
          )
        } else {
          let payment = new Payment(req.body)
          payment.save((err) => {
            if (err) return next(err)
            res.json({ success: true, message: payment })
          })
        }
      }
    )
  })

export default router
