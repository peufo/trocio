let Troc = require('../models/troc')
let noop = () => {}

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

function populateTrocUser(id, cb){
	Troc.findById(id)
		.populate('creator', 'name mail')
		.populate('admin', 'name mail')
		.populate('trader.user', 'name mail')
		.populate('cashier', 'name mail')
		.populate('tarif.apply', 'name mail')
		.lean({virtuals: true})
		.exec(cb)
}

async function findSpec(troc, user, cb = noop) {
    if (!troc) return cb(Error('troc query is required'))
    troc = await Troc.findById(troc, {tarif: 1, trader: 1}).exec()
	if (!troc) return cb(Error('Troc not found !'))
	let tarif = troc.tarif.filter(t => t.apply.map(a => a._id).indexOf(user) != -1)[0] || troc.tarif[0]
	let prefix = troc.trader.filter(t => t.user == user)[0]
	if (prefix) ({ prefix } = prefix)
	cb(null, {tarif, prefix})
	return {tarif, prefix}
}


function getFee(art, tarif) {
	if (tarif && tarif.fee.length && art.price > 0) {
		return art.fee = tarif.fee.sort((a, b) => b.price - a.price).filter(f => f.price <= art.price)[0].value 
	}else if (art.price == 0) {
		return art.fee = 0
	}else return art.fee || 0
}

function getMargin(art, tarif) {
	if (tarif && art.price) {
		return art.margin = tarif.margin * art.price
	}else{
		return art.margin = 0
	}
}

function lookupIfAdmin(troc, userId, cb) {
	let isAdmin = troc.admin.map(a => a.toString()).indexOf(userId) != -1
	if (isAdmin) {
		populateTrocUser(troc._id, (err, troc) => {
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

//return an error if not OK
function scheduleValidation({ schedule }) {
	if (schedule && schedule[0] && new Date(schedule[0].open).getTime() < new Date().getTime() + 1000*60*60*4 )
		return Error(`The troc cannot start in less than 4 hours`)
}

module.exports = {
	checkAdmin,
	checkCashier,
	populateTrocUser,
	findSpec,
    getFee,
	getMargin,
	lookupIfAdmin,
	scheduleValidation
}
