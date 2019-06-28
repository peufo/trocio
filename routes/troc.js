var express = require('express')
var Troc = require('../models/troc')
var ctrl = require('../controllers/troc')
var User = require('../models/user')
var ObjectId = require('mongoose').Types.ObjectId
var router = express.Router()

router
	.get('/', (req, res, next) => {
		Troc.find(req.query, (err, trocs) => {
			if (!err){
				res.json(trocs)
			}else next()
		})
	})
	.get('/:id', (req, res, next) => {
		ctrl.getTrocUser(req.params.id, (err, troc) => {
			if(err) return next(err)
			res.json(troc)
		})
	})
	.post('/', ctrl.createTroc)
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
	//Ajout du contrôle des droit
	.post('/:id/admin', ctrl.addAdmin)
	.post('/:id/cashier', ctrl.addCashier)
	.post('/:id/admin/remove', ctrl.removeAdmin)
	.post('/:id/cashier/remove', ctrl.removeCashier)

module.exports = router