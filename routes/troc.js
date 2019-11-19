var express = require('express')
var Troc = require('../models/troc')
var ctrl = require('../controllers/troc')
var router = express.Router()

router
	.get('/search', (req, res, next) => {
		let {search, start, end, north, east, sud, west} = req.query
		let query= {}

		if (search && search.length) {
			let regexp = new RegExp(search, 'i')
			query.$or = []
			query.$or.push({'name': regexp})
			query.$or.push({'description': 	regexp})
			query.$or.push({'address': 	regexp})
			query.$or.push({'society': 	regexp})
		}

		if (start || end || north || east || sud || west) query.$and = []

		if (start) 			query.$and.push({'schedule.close': {$gte: start}})
		if (end) 			query.$and.push({'schedule.open': {$lte: end}})
		if (!isNaN(north)) 	query.$and.push({'location.lat': {$lt: north}})
		if (!isNaN(east))  	query.$and.push({'location.lng': {$lt: east}})
		if (!isNaN(sud))   	query.$and.push({'location.lat': {$gt: sud}})
		if (!isNaN(west))  	query.$and.push({'location.lng': {$gt: west}})

		Troc.find(query).lean().exec((err, trocs) => {
			if (err) return next(err)

			//Admin and cashier becomes booleans
			if (req.session.user) {
				trocs.forEach(troc => {
					troc.isAdmin = troc.admin.map(a => a.toString()).indexOf(req.session.user._id.toString()) != -1
					troc.isCashier = troc.cashier.map(c => c.toString()).indexOf(req.session.user._id.toString()) != -1
				})
			}else{
				trocs.forEach(troc => {
					delete troc.admin
					delete troc.cashier
				})
			}
			res.json(trocs)
		})
	})
	.get('/:id/tarif', ctrl.checkAdmin, (req, res, next) => {
		Troc.findById(req.params.id, {tarif: 1}, (err, troc) => {
			if(err || !troc) return next(err || Error('Troc not found !'))
			res.json(troc)
		})
	})
	.get('/:trocId/tarif/:userId', (req, res, next) => {
		Troc.findById(req.params.trocId, {tarif: 1}, (err, troc) => {
			if(err || !troc) return next(err || Error('Troc not found !'))
			let tarifMatched = troc.tarif.filter(t => t.apply.map(a => a._id).indexOf(req.params.userId) != -1)			
			res.json(tarifMatched[0] || troc.tarif[0])
		})
	})
	.get('/:trocId/trader/:userId', (req, res, next) => {
		if (!req.session.user) return next(Error('Login required'))
		//if (req.session.user != req.param.userId) //TODO: Check if req.session.user is cashier
		Troc.findById(req.params.trocId, {trader: 1}, (err, troc) => {
			if(err || !troc) return next(err || Error('Troc not found !'))
			let index = troc.trader.map(t => t.user).indexOf(req.params.userId)	
			if (index === -1) {
				res.json({success: false, message: `User isn't a trader`})
			}else{
				res.json({success: true, message: 'User is a trader', prefix: troc.trader[index].prefix})
			}
			
		})
	})
	.get('/:id', (req, res, next) => {
		if (req.session.user) {

			Troc.findOne({_id: req.params.id}).lean().exec((err, troc) => {
				if (err || !troc) return next(err || Error('Not found'))

				lookupIfAdmin(troc, req.session.user._id.toString(), (err, troc) => {
					if (err || !troc) return next(err || Error('Not found'))
					res.json(troc)
				})
/*
				let isAdmin = troc.admin.map(a => a.toString()).indexOf(req.session.user._id.toString()) != -1
				
				if (isAdmin) {
					ctrl.getTrocUser(req.params.id, (err, troc) => {
						if (err || !troc) return next(err || Error('Not found'))
						troc.isAdmin = true
						troc.isCashier = false
						res.json(troc)
					})
				}else{
					troc.isAdmin = false
					troc.isCashier = troc.cashier.map(c => c.toString()).indexOf(req.session.user._id.toString()) != -1
					res.json(troc)
				}
*/
			})
	
		}else{
			Troc.findOne({_id: req.params.id}).lean().exec((err, troc) => {
				if (err || !troc) return next(err || Error('Not found'))
				delete troc.admin
				delete troc.cashier
				res.json(troc)
			})
		}
		
	})
	.post('/', ctrl.createTroc)
	.patch('/:id', ctrl.checkAdmin, (req, res, next) => {
		if (!req.session.user) return next(Error('Login required'))
		Troc.findOne({_id: req.params.id}).exec((err, troc) => {
			if(err || !troc) return next(err || Error('Not found'))
			
			if (req.body._id) delete req.body._id
			if (req.body.__v) delete req.body.__v
			for(p in req.body){troc[p] = req.body[p]}
			troc.save(err => {
				if (err) return next(err)
				
				lookupIfAdmin(troc, req.session.user._id.toString(), (err, troc) => {
					if (err || !troc) return next(err || Error('Not found'))
					res.json({success: true, message: troc})
				})
			})
		})
	})
	.post('/:id/admin', ctrl.checkAdmin, ctrl.addAdmin)
	.post('/:id/cashier', ctrl.checkAdmin, ctrl.addCashier)
	.post('/:id/trader', ctrl.checkAdmin, ctrl.addTrader)
	.post('/:id/admin/remove', ctrl.checkAdmin, ctrl.removeAdmin)
	.post('/:id/cashier/remove', ctrl.checkAdmin, ctrl.removeCashier)
	.post('/:id/trader/remove', ctrl.checkAdmin, ctrl.removeTrader)
	.post('/:id/trader/prefix', ctrl.checkAdmin, ctrl.editTraderPrefix)


function lookupIfAdmin(troc, userId, cb) {
	let isAdmin = troc.admin.map(a => a.toString()).indexOf(userId) != -1
	if (isAdmin) {
		ctrl.getTrocUser(troc._id, (err, troc) => {
			if (err || !troc) return cb(err || Error('Not found'))
			troc.isAdmin = true
			troc.isCashier = false
			cb(null, troc)
		})
	}else{
		troc.isAdmin = false
		troc.isCashier = troc.cashier.map(c => c.toString()).indexOf(userId) != -1
		cb(null, troc)
	}
}

module.exports = router