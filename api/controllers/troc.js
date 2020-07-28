var Troc = require('../models/troc')
var User = require('../models/user')
var Article = require('../models/article')
var Payment = require('../models/payment')

function checkAdmin(req, res, next) {
	if (!req.session.user) return next(Error('Login required'))
	Troc.findOne({_id: req.params.id || req.params.trocId || req.query.troc}, {admin: 1}, (err, troc) => {
		if (err || !troc) return next(err || Error('troc not found !'))
		let isAdmin = troc.admin.map(a => a.toString()).indexOf(req.session.user._id.toString()) != -1
		if (isAdmin) {
			next()
		}else{
			return next(Error('Sorry, you are not a administrator of this troc'))
		}
	})
}

function checkCashier(req, res, next) {
	if (!req.session.user) return next(Error('Login required'))
	Troc.findOne({_id: req.params.id || req.params.trocId || req.query.troc}, {admin: 1, cashier: 1}, (err, troc) => {
		if (err || !troc) return next(err || Error('troc not found !'))
		let isAdmin = troc.admin.map(a => a.toString()).indexOf(req.session.user._id.toString()) != -1
		let isCashier = troc.cashier.map(a => a.toString()).indexOf(req.session.user._id.toString()) != -1
		if (isAdmin || isCashier) {
			next()
		}else{
			return next(Error('Sorry, you are not a cashier of this troc'))
		}
	})
}

function getTrocUser(id, cb){
	Troc.findById(id)
		.populate('creator', 'name mail')
		.populate('admin', 'name mail')
		.populate('trader.user', 'name mail')
		.populate('cashier', 'name mail')
		.populate('tarif.apply', 'name mail')
		.lean()
		.exec(cb)
}

function getStats(req, res, next) {
	Troc.findOne({_id: req.params.id}).exec((err, troc) => {
		if (err || !troc) return next(err || Error('Troc not found'))

		let query = {troc: troc._id}
		let user = req.query.user

		if (req.query.view == 'traders') {
			user = {$in: troc.trader.map(t => t.user)}
		}else if (req.query.view == 'privates') {
			user = {$nin: troc.trader.map(t => t.user)}
		}
		
		if (req.query.view != 'global' || user){
			query.provider = user
		}

		Article.find(query).sort({createdAt: 1}).lean().exec((err, articlesProposed) => {
			if (err) return next(err)

			delete query.provider
			if (user) query.buyer = user
			query.sold = {$exists: true}
			Article.find(query).sort({createdAt: 1}).lean().exec((err, articlesBuyed) => {
				if (err) return next(err)

				delete query.buyer
				delete query.sold
				if (user) query.user = user
				Payment.find(query).sort({createdAt: 1}).lean().exec((err, payments) => {
					if (err) return next(err)
					res.json({articlesProposed, articlesBuyed, payments})
				})
			})
		})

	})
}

function createTroc(req, res, next) {
	if (!req.session.user) return next(Error('Login required'))
	
	var troc = new Troc(req.body)
	troc.creator = req.session.user._id
	troc.admin = [req.session.user._id]
	troc.tarif = {
		name: 'Standard', 
		bydefault: true,
		margin: 0.1,
		fee: [
			{price: 0, value: 0.5},
			{price: 5, value: 1}
		]
	}

	User.findOne({_id: req.session.user._id}, (err, user) => {
		if (err || !user) return next(err || Error('User not found !'))
		if (!user.creditTroc) return next(Error('No credit'))

		troc.save(err => {
			if (err) return next(err)
		
		
			user.trocs.push(troc._id)
			user.creditTroc--
			user.save(err => {
				if (err) return next(err)
				getTrocUser(troc._id, (err, troc) => {
					if(err) return next(err)
					res.json({success: true, message: troc})
				})
			})
		})
	})
}


function resTrocUser(req, res, next) {
	getTrocUser(req.params.id, (err, troc) => {
		if(err) return next(err)
		res.json({success: true, message: troc})
	})
}

function addAdmin(req, res, next) {
	User.findById(req.body.admin, (err, user) => {
		if (err || !user) return next(err || Error('User not found'))

		Troc.findById(req.params.id, (err, troc) => {
			if (err || !troc) return next(err || Error('Troc not found'))

			//Check if user is already admin
			var index = troc.admin.map(a => a._id).indexOf(req.body.admin)
			if (index != -1) return next(Error('User is already admin'))

			//Removed of cashiers
			index = troc.cashier.map(c => c._id).indexOf(req.body.admin)
			if (index != -1) troc.cashier.splice(index, 1)

			troc.admin.push(req.body.admin)

			troc.save(err => {
				if (err) return next(err)
				addInUserList(user, troc, err => {
					if (err) return next(err)
					resTrocUser(req, res, next)
				})
			})
		})
	})
}

function addCashier(req, res, next) {
	User.findById(req.body.cashier, (err, user) => {
		if (err || !user) return next(err || Error('User not found')) 

		Troc.findById(req.params.id, (err, troc) => {
			if (err || !troc) return next(err || Error('Troc not found'))

			//Check if user is already cashier
			var index = troc.cashier.map(a => a._id).indexOf(req.body.cashier)
			if (index != -1) return next(Error('User is already cashier'))

			//Removed of administrators
			var index = troc.admin.map(a => a._id).indexOf(req.body.cashier)
			if (index != -1) {
				if (req.session.user._id == req.body.cashier) return next(Error(`You can't become a cashier`))
				if (troc.creator == req.body.cashier) return next(Error(`The creator can't become a cashier`))
				troc.admin.splice(index, 1)
			}

			troc.cashier.push(req.body.cashier)
			troc.save(err => {
				if (err) return next(err)
				addInUserList(user, troc, err => {
					if (err) return next(err)
					resTrocUser(req, res, next)
				})
			})					

		})
	})
}

function addTrader(req, res, next) {
	User.findById(req.body.trader, (err, user) => {
		if (err || !user) return next(err || Error('User not found')) 

		Troc.findById(req.params.id, (err, troc) => {
			if (err || !troc) return next(err || Error('Troc not found'))

			if (!troc.trader) troc.trader = []
			troc.trader.push({user: req.body.trader, prefix: req.body.prefix ? req.body.prefix : ''})
			troc.save(err => {
				if (err) return next(err)
				addInUserList(user, troc, err => {
					if (err) return next(err)
					resTrocUser(req, res, next)
				})
			})					

		})
	})
}

function removeAdmin(req, res, next) {
	User.findById(req.body.admin, (err, user) => {
		if (err || !user) return next(err || Error('User not found'))

		Troc.findById(req.params.id, (err, troc) => {
			if (err || !troc) return next(err || Error('Troc not found'))

			var index = troc.admin.map(a => a._id).indexOf(req.body.admin)
			if (index == -1) return next(Error(`Admin ${req.body.admin} not found`))

			if (troc.creator == req.body.admin) return next(Error(`Can't remove the creator`))
			if (req.session.user._id == req.body.admin) return next(Error(`Can't remove yourself`))
			troc.admin.splice(index, 1)

			troc.save(err => {
				if (err) return next(err)
				removeInUserList(user, troc, err => {
					if (err) return next(err)
					resTrocUser(req, res, next)
				})
			})
		})
	})
}

function removeCashier(req, res, next) {
	User.findById(req.body.cashier, (err, user) => {
		if (err || !user) return next(err || Error('User not found'))

		Troc.findById(req.params.id, (err, troc) => {
			if (err || !troc) return next(err || Error('Troc not found'))

			var index = troc.cashier.map(c => c._id).indexOf(req.body.cashier)
			if (index == -1) return next(Error(`Cashier ${req.body.cashier} not found`))

			troc.cashier.splice(index, 1)
			troc.save(err => {
				if (err) return next(err)
				removeInUserList(user, troc, err => {
					if (err) return next(err)
					resTrocUser(req, res, next)
				})
			})
		})
	})
}

function removeTrader(req, res, next) {
	User.findById(req.body.trader, (err, user) => {
		if (err || !user) return next(err || Error('User not found'))

		Troc.findById(req.params.id, (err, troc) => {
			if (err || !troc) return next(err || Error('Troc not found'))

			var index = troc.trader.map(c => c.user._id).indexOf(req.body.trader)
			if (index == -1) return next(Error(`Trader ${req.body.trader} not found`))

			troc.trader.splice(index, 1)
			troc.save(err => {
				if (err) return next(err)
				removeInUserList(user, troc, err => {
					if (err) return next(err)
					resTrocUser(req, res, next)
				})
			})
		})
	})
}

function editTraderPrefix(req, res, next){
	User.findById(req.body.trader, (err, user) => {
		if (err || !user) return next(err || Error('User not found'))

		Troc.findById(req.params.id, (err, troc) => {
			if (err || !troc) return next(err || Error('Troc not found'))

			if (troc.trader.map(t => t.prefix).indexOf(req.body.prefix) != -1) return next(Error(`Prefix ${req.body.prefix} is already used`))

			var index = troc.trader.map(c => c.user._id).indexOf(req.body.trader)
			if (index == -1) return next(Error(`Trader ${req.body.trader} not found`))

			troc.trader[index].prefix = req.body.prefix
			troc.save(err => {
				if (err) return next(err)
				res.json({success: true, message: 'Prefix changed'})
			})
		})
	})
}

function addInUserList(user, troc, cb) {
	//Doit s'assurer que le troc n'éxiste pas déjà
	var index = user.trocs.map(t => t.troc).indexOf(troc._id)
	if (index == -1) {
		user.trocs.push(troc._id)
		user.save(err => {
			if (err) return cb(err)
			cb()
		})
	}else cb()
}

//Vraiment util ?
function removeInUserList(user, troc, cb) {
	var index = user.trocs.indexOf(troc._id)
	if (index != -1) {
		user.trocs.splice(index, 1)
		user.save(err => {
			if (err) return cb(err)
			cb()
		})
	}else cb()
}

module.exports = {
	getTrocUser,
	getStats,
	checkAdmin,
	checkCashier,
	createTroc,
	resTrocUser,
	addAdmin,
	addCashier,
	addTrader,
	removeAdmin,
	removeCashier,
	removeTrader,
	editTraderPrefix,
}