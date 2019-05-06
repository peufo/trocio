var express 	= require('express')
var User 		= require('../models/user')
var ObjectId 	= require('mongoose').Types.ObjectId
var router 		= express.Router()
var jwt 		= require('jsonwebtoken')
var config      = require('../config');


var lookupBuy = {$lookup: {from: 'article', foreignField: '_id', localField: 'buy', as: 'buy'}}
var lookupProvide = {$lookup: {from: 'article', foreignField: '_id', localField: 'provide', as: 'provide'}}

/* GET users listing. */
router
	.post('/', (req, res) => {
		var user = new User(req.body);
		user.save(function(err){
			if (!err) {
				res.status(201).json({success: true, massage: 'Inscritpion réussie!'})
			}else{
				res.json({success: false, message: 'Ce mail est déjà utilisé pour un autre compte!'})
			}
		})
	})
	.post('/login', (req, res) => {
		User.getAuthenticated(req.body.mail, req.body.password, function(err, user, reason){
			if (!err) {
				if (user) {
					// TODO envoyer l'id
					var payload = {admin: user.admin}
					var token = jwt.sign(payload, config.secret, {expiresIn: '24h'})
					res.json({
						success: true,
						message: 'Connecté',
						token: token
					})
				}else{
					var reasons = User.failedLogin
					switch(reason){
						case reasons.NOT_FOUND:
							res.json({
								success: false,
								message: 'Le mail indiqué n\'est pas associé à un compte!'
							})
							break
						case reasons.PASSWORD_INCORRECT:
							res.json({
								success: false,
								message: 'Mot de passe invalide!'
							})
							break
						case reasons.MAX_ATTEMPTS:
							res.json({
								success: false,
								message: 'Ce compte est temporairement verrouillé!'
							})	
							break
						default:
							res.json({
								success: false,
								message: 'Erreur, raison introuvable!'
							})
					}
				}
			}else{
				res.json({
					success: false,
					message: 'Erreur!'
				})
			}
		})
	})
	.get('/', (req, res, next) => {
		User.find({}, (err, users) => {
			if (!err){
				res.json(users)
			}else next()
		})
	})
	.get('/articles', (req, res, next) => {
		User.aggregate([lookupBuy, lookupProvide], (err, user) => {
			if (!err){
				res.json(user)
			}else next()
		})
	})
	.get('/events', (req, res, next) => {
		User.aggregate([{$match: {}}, lookupProvide, lookupBuy], (err, users) => {
			if (!err){
				var events = []
				users.forEach(user => events = [...events, ...GetUserEvents(user)])
				res.json(events)		
			}else next()
		})
	})
	.get('/:id', (req, res, next) => {
		User.findById(req.params.id, (err, user) => {
			if (!err){
				res.json(user)
			}else next()
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
			}else next()
		})
	})
	.patch('/:id', (req, res, next) => {
		User.findById(req.params.id, (err, user) => {
			if (!err && user){
				if (req.body._id) delete req.body._id
				for (var p in req.body){user[p] = req.body[p]}
				user.save()
				res.json(user)
			}else next()
		})
	})
	.delete('/:id', (req, res, next) => {
		User.findById(req.params.id, (err, user) => {
			if (!err && user){
				user.remove(err => {
					if (!err) {
						res.status(204).send('removed')
					}else{
						next()
					}
				})
			}else {
				next()
			}
		})
	})
	.get('/:id/articles', (req, res, next) => {
		User.aggregate([{$match: {_id: ObjectId(req.params.id)}}, lookupProvide, lookupBuy], (err, users) => {
			if (!err && users.length > 0){
				res.json(users[0])
			}else next()
		})
	})
	.get('/:id/events', (req, res, next) => {
		User.aggregate([{$match: {_id: ObjectId(req.params.id)}}, lookupProvide, lookupBuy], (err, users) => {
			if (!err && users.length > 0){
				var events = GetUserEvents(users[0])
				res.json(events)		
			}else next()
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