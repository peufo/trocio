var router 	= require('express').Router()
var User = require('../models/user')
var Troc = require('../models/troc')
var User = require('../models/user')


router
    .get('/', checkSuperAdmin, (req, res, next) => {
        res.json('Hey super admin')
    })
    .post('/addCredit/:userId', checkSuperAdmin, (req, res, next) => {
        User.findOne({_id: req.params.userId}, {mail: 1, creditTroc: 1}, (err, user) => {
            if (err || !user) return next(err || Error('User not found'))
            if (user.creditTroc) user.creditTroc++
            else user.creditTroc = 1
            user.save(err => {
                if (err) return next(err)
                res.json({success: true, message: `One credit is added for ${user.mail}\nTotal: ${user.creditTroc}`})
            })
        })
    })
    .get('/users', (req, res, next) => {
		User.find(req.query, {name: 1}, (err, users) => {
			if (!err){
				res.json(users)
			}else next(err)
		})
	})
    .get('/trocs', checkSuperAdmin, (req, res, next) => {
		Troc.find(req.query, (err, trocs) => {
			if (err) return next(err)
			res.json(trocs)
		})
    })
    

function checkSuperAdmin(req, res, next) {
    if (!req.session.user) return next(Error('Login required'))
    if (!process.env.TROCIO_ADMIN) return next(Error('The environment variable TROCIO_ADMIN is undefined'))
    if (process.env.TROCIO_ADMIN != req.session.user.mail) return next(Error('Access denied'))
    next()
}

module.exports = router