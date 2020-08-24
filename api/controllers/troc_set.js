var Troc = require('../models/troc')
var User = require('../models/user')
var Subscribe = require('../models/subscribe')
let { lookupIfAdmin, populateTrocUser } = require('../controllers/troc_utils')

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
	
	let subscribe = new Subscribe({user: req.session.user._id, troc: troc._id})

	User.findOne({_id: req.session.user._id}, (err, user) => {
		if (err || !user) return next(err || Error('User not found !'))
		let freeTroc = Number(process.env.TROCIO_OPTIONS_FREE_TROC)
		if (Number.isNaN(freeTroc)) freeTroc = 0
		if (user.creditTroc < -freeTroc) return next(Error('No credit'))
		user.creditTroc--
		Promise.all([troc.save(), user.save(), subscribe.save()]).then(() => {
			populateTrocUser(troc._id, (err, troc) => {
				if(err) return next(err)
				res.json({success: true, message: troc})
			})
		}).catch(next)
	})
}

function patchTroc(req, res, next) {
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
				resTrocUser(req, res, next)
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
				resTrocUser(req, res, next)
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
				resTrocUser(req, res, next)
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
				resTrocUser(req, res, next)
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
				resTrocUser(req, res, next)
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
				resTrocUser(req, res, next)
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

function resTrocUser(req, res, next) {
	populateTrocUser(req.params.id, (err, troc) => {
		if(err) return next(err)
		res.json({success: true, message: troc})
	})
}

module.exports = {
    createTroc,
    patchTroc,
	addAdmin,
	addCashier,
	addTrader,
	removeAdmin,
	removeCashier,
	removeTrader,
	editTraderPrefix,
}
