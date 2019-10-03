var express 	= require('express')
var User 		= require('../models/user')
var ObjectId 	= require('mongoose').Types.ObjectId
var router = express.Router()
var config = require('../config')
var { createUser, login, checkLogin, logout, resetpwd, sendValidMail, validMail, changepwd } = require('../controllers/user')
var lookupBuy = {$lookup: {from: 'article', foreignField: '_id', localField: 'buy', as: 'buy'}}
var lookupProvide = {$lookup: {from: 'article', foreignField: '_id', localField: 'provide', as: 'provide'}}

router
	.post('/', createUser)
	.post('/login', login)
	.post('/changepwd', changepwd)
	.post('/resetpwd', resetpwd)
	.post('/sendValidmail', sendValidMail)
	.get('/validmail/:url', validMail)
	.get('/me', (req, res, next) => {
		if (!req.session.user) return res.json({success: false, message: 'Login required'})
		
		User.findOne({_id: req.session.user._id}, {name: 1, mail: 1, mailvalided: 1, trocs: 1})
		.populate('trocs', 'name admin cashier') 
		.exec((err, user) => {
			if (err || !user) return next(err || Error('User not found !'))
			//Admin and cashier becomes booleans
			var me = {
				_id: user._id,
				name: user.name,
				mail: user.mail,
				mailvalided: user.mailvalided,
				trocs: user.trocs.map(troc => {
					return {
						_id: troc._id,
						name: troc.name,
						admin: troc.admin.indexOf(user._id) != -1,
						cashier: troc.cashier.indexOf(user._id) != -1
					}
				})
			}

			res.json(me)
		})
	})
	.patch('/me', (req, res, next) => {
		if (!req.session.user) return res.json({success: false, message: 'Login required'})

		User.findById(req.session.user._id, (err, user) => {
			if (err || !user) return next(err || Error('User not found !'))
			if (req.body._id) delete req.body._id
			if (req.body.mailvailded) delete req.body.mailvailded
			if (req.body.trocs) delete req.body.trocs
			if (req.body.loginAttempts) delete req.body.loginAttempts
			for (var p in req.body){user[p] = req.body[p]}
			user.save(err => {
				if (err) return next(err)
				res.json({success: true})
			})
		})
	})
	.get('/logout', logout)
	.get('/', (req, res, next) => {
		User.find(req.query, {name: 1}, (err, users) => {
			if (!err){
				res.json(users)
			}else next(err)
		})
	})
	.get('/search/:search', (req, res, next) => {
		var regexp = new RegExp(req.params.search, 'i')
		User.find({$or: [{name: regexp}, {mail: regexp}]}, {name: 1, mail: 1})
			.limit(10)
			.exec((err, users) => {
			if (!err){
				res.json(users)
			}else next(err)
		})
	})
	.get('/articles', (req, res, next) => {
		User.aggregate([lookupBuy, lookupProvide], (err, user) => {
			if (!err){
				res.json(user)
			}else next(err)
		})
	})
	.get('/events', (req, res, next) => {
		User.aggregate([{$match: {}}, lookupProvide, lookupBuy], (err, users) => {
			if (!err){
				var events = []
				users.forEach(user => events = [...events, ...GetUserEvents(user)])
				res.json(events)		
			}else next(err)
		})
	})
	.get('/:id', (req, res, next) => {
		User.findById(req.params.id, (err, user) => {
			if (!err){
				res.json(user)
			}else next(err)
		})
	})
	.get('/:id/articles', (req, res, next) => {
		User.aggregate([{$match: {_id: ObjectId(req.params.id)}}, lookupProvide, lookupBuy], (err, users) => {
			if (!err && users.length > 0){
				res.json(users[0])
			}else next(err)
		})
	})
	.get('/:id/events', (req, res, next) => {
		User.aggregate([{$match: {_id: ObjectId(req.params.id)}}, lookupProvide, lookupBuy], (err, users) => {
			if (!err && users.length > 0){
				var events = GetUserEvents(users[0])
				res.json(events)		
			}else next(err)
		})
	})

function GetUserEvents(user){
	var events = [{type: 'signup', time: user.signup, user: user._id}]
		user.provide.forEach(art => events = [...events, ...GetArtEvents(art)])
		if(user.buy) user.buy.forEach(art => events.push({type: 'buy', time: art.sold, art: art._id, user: art.buyer}))
		if(user.pay) user.pay.forEach(pay => events.push({type: 'pay', time: pay.time, move: pay.amount, user: user._id}))
	return events
}

function GetArtEvents(art){
	var events = [{type: 'declared', time: art.declared, art: art._id, user: art.provider}]
	if (art.valided) events.push({type: 'valided', time: art.valided, art: art._id, user: art.provider})
	else if (art.deleted) events.push({type: 'deleted', time: art.deleted, art: art._id, user: art.provider})
	if (art.sold) events.push({type: 'sold', time: art.sold, art: art._id, user: art.provider})
	else if (art.recover) events.push({type: 'recover', time: art.recover, art: art._id, user: art.provider})
	return events;
}


module.exports = router