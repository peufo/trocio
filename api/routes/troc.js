var express = require('express')
var Troc = require('../models/troc')
var ctrl = require('../controllers/troc')
var router = express.Router()
const ObjectId 	= require('mongoose').Types.ObjectId
let { getSpec, getDetails } = require('../controllers/troc_get')

router
	.get('/me', (req, res, next) => {
		if (!req.session.user) return next(Error('Login required'))
		Troc.find({_id: {$in: req.session.user.trocs}}, 
			'name description address location admin cashier schedule society societyweb')
			.lean().exec((err, trocs) => {
				if (err || !trocs) return next(err || Error('No trocs'))
				trocs.forEach(troc => {
					troc.isAdmin = troc.admin.map(a => a.toString()).indexOf(req.session.user._id.toString()) != -1
					troc.isCashier = troc.cashier.map(c => c.toString()).indexOf(req.session.user._id.toString()) != -1
					if (!troc.isAdmin && !troc.isCashier) troc.admin = troc.cashier = undefined
				})
				res.json(trocs)
		})
	})
	.get('/details', getDetails)
	.get('/spec', getSpec)
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
	
	.get('/:id/stats', ctrl.checkAdmin, ctrl.getStats)
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
	.get('/:id/providername', (req, res, next) => {
		Troc.findOne({_id: req.params.id}, {provider: 1}).populate('provider', 'name').exec((err, troc) => {
			if (err) return next(err)
			res.json(troc.provider)
		})
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