var router 	= require('express').Router()
var User = require('../models/user')
var Troc = require('../models/troc')
var User = require('../models/user')


router
    .get('/', (req, res, next) => {
        res.json('Hey super admin')
    })
    .post('/addCredit/:userId', (req, res, next) => {
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
    .get('/trocs', (req, res, next) => {
		Troc.find(req.query, (err, trocs) => {
			if (err) return next(err)
			res.json(trocs)
		})
    })
    

module.exports = router