var router 	= require('express').Router()
var User = require('../models/user')

router
    .get('/', checkSuperAdmin, (req, res, next) => {
        res.json('Hey super admin')
    })
    .get('/addCredit/:userId', checkSuperAdmin, (req, res, next) => {
        User.findOne({_id: req.params.userId}, {mail: 1, creditTroc: 1}, (err, user) => {
            if (err) return next(Error('User not found'))
            if (user.creditTroc) user.creditTroc++
            else user.creditTroc = 1
            user.save(err => {
                if (err) return next(err)
                res.json({success: true, message: `One credit is added for ${user.mail}\nTotal: ${user.creditTroc}`})
            })
        })
    })

function checkSuperAdmin(req, res, next) {
    if (!req.session.user) return next(Error('Login required'))
    if (!process.env.TROCIO_ADMIN) return next(Error('The environment variable TROCIO_ADMIN is undefined'))
    if (process.env.TROCIO_ADMIN != req.session.user.mail) return next(Error('Access denied'))
    next()
}

module.exports = router