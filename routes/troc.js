var express = require('express')
var Troc = require('../models/troc')
var ctrl = require('../controllers/troc')
var router = express.Router()

router
	//Reserved for root user
	.get('/', (req, res, next) => {
		Troc.find(req.query, (err, trocs) => {
			if (err) return next(err)
			res.json(trocs)
		})
	})
	.get('/search', (req, res, next) => {
		let {search, start, stop, north, east, sud, west} = req.query
		let query= {}

		if (search && search.length) {
			console.log(search)
			let regexp = new RegExp(search, 'i')
			query.$or = []
			query.$or.push({'name': regexp})
			query.$or.push({'description': 	regexp})
			query.$or.push({'address': 	regexp})
			query.$or.push({'society': 	regexp})
		}

		if (start || stop || north || east || sud || west) query.$and = []

		if (start) {}
		if (stop) {}
		if (!isNaN(north)) query.$and.push({'location.lat': {$lt: north}})
		if (!isNaN(east))  query.$and.push({'location.lng': {$lt: east}})
		if (!isNaN(sud))   query.$and.push({'location.lat': {$gt: sud}})
		if (!isNaN(west))  query.$and.push({'location.lng': {$gt: west}})

		console.log(query)
		console.log(req.query)

		Troc.find(query).exec((err, trocs) => {
			if (err) return next(err)
			res.json(trocs)
		})
	})
	.get('/:id', (req, res, next) => {
		if (!req.session.user) return next(Error('Login required'))
		ctrl.getTrocUser(req.params.id, (err, troc) => {
			if(err) return next(err)
			res.json(troc)
		})
	})
	.post('/', ctrl.createTroc)
	//TODO: Ajout du contrôle des droit
	.patch('/:id', (req, res, next) => {
		if (!req.session.user) return next(Error('Login required'))
		ctrl.getTrocUser(req.params.id, (err, troc) => {
			if(err || !troc) return next(err || Error('Troc not found'))
			if (req.body._id) delete req.body._id
			if (req.body.__v) delete req.body.__v
			for(p in req.body){troc[p] = req.body[p]}
			troc.save(err => {
				if (err) return next(err)
				res.json({success: true, message: troc})
			})
		})
	})
	.post('/:id/admin', ctrl.addAdmin)
	.post('/:id/cashier', ctrl.addCashier)
	.post('/:id/admin/remove', ctrl.removeAdmin)
	.post('/:id/cashier/remove', ctrl.removeCashier)

module.exports = router