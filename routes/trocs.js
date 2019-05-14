var express = require('express')
var Troc = require('../models/troc')
var User = require('../models/user')
var ObjectId = require('mongoose').Types.ObjectId
var router = express.Router()

var lookupArt = {$lookup: {from: 'articles', foreignField: '_id', localField: 'art', as: 'art' }}
var lookupAdmin = {$lookup: {from: 'users', foreignField: '_id', localField: 'admin', as: 'admin' }}
var lookupCashier = {$lookup: {from: 'users', foreignField: '_id', localField: 'cashier', as: 'cashier' }}
var lookupProvider = {$lookup: {from: 'users', foreignField: '_id', localField: 'provider', as: 'provider' }}


router
	.get('/', (req, res, next) => {
		Troc.aggregate([{$match: {}}], (err, trocs) => {
			if (!err){
				res.json(trocs)
			}else next()
		})
	})
	.post('/', (req, res, next) => {
		var troc = new Troc(req.body)
		troc.save()
		res.status(201).json(troc)
	})
	.get('/articles', (req, res, next) => {
		Troc.aggregate([lookupArt], (err, trocs) => {
			if(!err){
				res.json(trocs)
			}else next()
		})
	})
	.get('/users', (req, res, next) => {
		Troc.aggregate([lookupAdmin, lookupCashier], (err, trocs) => {
			if (!err) {
				res.json(trocs)
			}else next()
		})
	})
	.get('/admin', (req, res, next) => {
		Troc.aggregate([lookupAdmin], (err, trocs) => {
			if (!err) {
				res.json(trocs)
			}else next()
		})
	})
	.get('/cashier', (req, res, next) => {
		Troc.aggregate([lookupCashier], (err, trocs) => {
			if (!err) {
				res.json(trocs)
			}else next()
		})
	})
	.get('/provider', (req, res, next) => {
		Troc.aggregate([
			lookupArt, 
			{$project: {_id: 0, provider: '$art.provider'}},
			{$unwind: '$provider'}
			],
		(err, trocs) => {
			if(!err){
				res.json(trocs)
			}else next(err)
		})
	})
	.get('/:id', (req, res, next) => {
		Troc.findById(req.params.id, (err, troc) => {
			if(!err){
				res.json(troc)
			}else next()
		})
	})
	.put('/:id', (req, res, next) => {
		Troc.findById(req.params.id, (err, troc) => {
			if(!err && troc) {
				troc.name = req.body.name
				troc.address = req.body.address
				troc.open = req.body.open
				troc.close = req.body.close
				troc.admin = req.body.admin
				troc.cashier = req.body.cashier
				troc.art = req.body.art
				troc.save()
				res.json(troc)
			}else next(err || Error('Troc not found')
		})
	})
	.patch('/:id', (req, res, next) => {
		Troc.findById(req.params.id, (err, troc) => {
			if(!err && troc){
				if (req.body._id) delete req.body._id
				for(p in req.body){troc[p] = req.body[p]}
				troc.save()
				res.json(troc)
			}else next(err || Error('Troc not found')
		})
	})
	.get('/:id/articles', (req, res, next) => {
		Troc.aggregate([{$match: {_id: ObjectId(req.params.id)}}, lookupArt], (err, troc) => {
			if(!err && troc){
				res.json(troc[0])
			}else next(err || Error('Troc not found')
		})
	})
	.get('/:id/users', (req, res, next) => {
		Troc.aggregate([{$match: {_id: ObjectId(req.params.id)}}, lookupAdmin, lookupCashier], (err, troc) => {
			if (!err && troc) {
				res.json(troc)
			}else next(err || Error('Troc not found')
		})
	})
	.get('/:id/admin', (req, res, next) => {
		Troc.aggregate([{$match: {_id: ObjectId(req.params.id)}}, lookupAdmin], (err, troc) => {
			if (!err && troc) {
				res.json(troc)
			}else next(err || Error('Troc not found')
		})
	})
	.post('/:id/admin', (req, res, next) => {
		User.findById(req.body.admin, (err, user) => {
			if (!err && user) {
				Troc.findById(req.params.id, (err, troc) => {
					if (!err && troc){
						troc.admin.push(req.body.admin)
						troc.save()
						res.json(troc)
					}else next()
				})
			}else next(err || Error('User not found')
		})
	})
	.get('/:id/cashier', (req, res, next) => {
		Troc.aggregate([{$match: {_id: ObjectId(req.params.id)}}, lookupCashier], (err, troc) => {
			if (!err && troc) {
				res.json(trocs)
			}else next(err || Error('Troc not found')
		})
	})
	.post('/:id/cashier', (req, res, next) => {
		User.findById(req.body.cashier, (err, user) => {
			if (!err && user) {
				Troc.findById(req.params.id, (err, troc) => {
					if (!err && troc){
						troc.cashier.push(req.body.cashier)
						troc.save()
						res.json(troc)
					}else next()
				})
			}else next(err || Error('User not found'))
		})
	})

module.exports = router