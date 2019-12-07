var express = require('express')
var Payment = require('../models/payment')
var Troc = require('../models/troc')
var { checkAdmin } = require('../controllers/troc')
var router = express.Router()

router
    .get('/', (req, res, next) => {

        //TODO: Check if admin, cashier or simple user

        if (req.query.user === 'false' || req.query.user === 'undefined') { //For anonyme client
			req.query.user = { $exists: false }
			if (req.session.user) req.query.acceptor = req.session.user._id
		}

        if (req.query.troc && req.query.user) {
            Payment.find(req.query).sort({updatedAt: -1}).exec((err, payments) => {
                if (err) return next(err)
                res.json(payments)
            })
        }else{
            return next(Error('Query troc and user is required !'))
        }
    })
    .post('/', (req, res, next) => {
        if (!req.session.user) return next(Error('Login required !'))

        Troc.findOne({_id: req.body.troc}, {admin: 1, cashier: 1}, (err, troc) => {
            if (err || !troc) return next(err || Error('Troc not found !'))
            
            //Contrôle le droit de fair un payment (admin ou caissier)
            if (troc.admin.indexOf(req.session.user._id) == -1 && troc.cashier.indexOf(req.session.user._id) == -1) {
                return next(Error(`you are not allowed to make a payment on this troc`))
            }else{
                let payment = new Payment(req.body)
                payment.save(err => {
                    if (err) return next(err)
                    res.json({success: true, message: payment})
                })
            }
        })
    })


module.exports = router;