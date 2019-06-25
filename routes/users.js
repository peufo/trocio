var express 	= require('express')
var User 		= require('../models/user')
var ObjectId 	= require('mongoose').Types.ObjectId
var router = express.Router()
var config = require('../config')
var { login, checkLogin, logout } = require('../controllers/utils')

var lookupBuy = {$lookup: {from: 'article', foreignField: '_id', localField: 'buy', as: 'buy'}}
var lookupProvide = {$lookup: {from: 'article', foreignField: '_id', localField: 'provide', as: 'provide'}}

router
	.post('/', (req, res, next) => {
		var user = new User(req.body);
		user.save(err => {
			if (!err) {
				res.status(201).json({success: true, massage: 'Inscritpion réussie!'})
			}else next(err)
		})
	})
	.post('/login', login)
	.get('/me', checkLogin, (req, res, next) => {
		User.findOne({_id: req.session.user._id}, {name: 1, trocs: 1})
			.populate('trocs.troc', 'name admin cashier')
			.exec((err, user) => {
			if (err || !user) return next(err || Error('User not found !'))
			res.json(user)
		})

	})
	.get('/logout', logout)
	.get('/', (req, res, next) => { //doit être sécurisé...
		User.find({}, (err, users) => {
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
	.put('/:id', (req, res, next) => {
		User.findById(req.params.id, (err, user) => {
			if (!err && user){
				user.name = req.body.name
				user.birth = req.body.birth
				user.phone = req.body.phone
				user.mail = req.body.mail
				user.save()
				res.json(user)
			}else next(err)
		})
	})
	.patch('/:id', (req, res, next) => {
		User.findById(req.params.id, (err, user) => {
			if (!err && user){
				if (req.body._id) delete req.body._id
				for (var p in req.body){user[p] = req.body[p]}
				user.save()
				res.json(user)
			}else next(err)
		})
	})
	.delete('/:id', (req, res, next) => {
		User.findById(req.params.id, (err, user) => {
			if (!err && user){
				user.remove(err => {
					if (!err) {
						res.status(204).send('removed')
					}else next(err)
				})
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