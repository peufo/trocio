var router 	= require('express').Router()
var User = require('../models/user')
var Troc = require('../models/troc')
var Article = require('../models/article')
var Payment = require('../models/payment')


router
    .get('/', (req, res, next) => {
        res.json({success: true, message: 'Yo root user'})
    })
    .post('/addcredit', (req, res, next) => {
        let { user } = req.body
        User.findOne({_id: user}, {mail: 1, creditTroc: 1}, (err, user) => {
            if (err || !user) return next(err || Error('User not found'))
            if (user.creditTroc) user.creditTroc++
            else user.creditTroc = 1
            user.save(err => {
                if (err) return next(err)
                res.json({message: `One credit is added for ${user.mail}\nTotal: ${user.creditTroc}`})
            })
        })
    })
    .get('/users', (req, res, next) => {
     	User.find(req.query, (err, users) => {
        	if (err)return next(err)
         	res.json(users)
      	})
	})
    .get('/trocs', (req, res, next) => {
      	Troc.find(req.query, (err, trocs) => {
        	if (err) return next(err)
        	res.json(trocs)
      	})
    })
    .get('/articles', (req, res, next) => {
      	Article.find(req.query, (err, articles) => {
        	if (err) return next(err)
        	res.json(articles)
      	})
    })
    .get('/payments', (req, res, next) => {
      	Payment.find(req.query, (err, payments) => {
        	if (err) return next(err)
        	res.json(payments)
      	})
    })
    .get('/mails', (req, res, next) => {
        User.find(req.query, {mail: 1}, (err, users) => {
            if (err) return next(err)
            let str = users.map(user => user.mail).join('<br>')
            res.send(str)
        })
    })
    

module.exports = router
