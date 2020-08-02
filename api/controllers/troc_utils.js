let Troc = require('../models/troc')
let noop = () => {}

async function findSpec(troc, user, cb = noop) {
    if (!troc) return cb(Error('troc query is required'))
    troc = await Troc.findById(troc, {tarif: 1, trader: 1}).exec()
	if (!troc) return cb(Error('Troc not found !'))
	let tarif = troc.tarif.filter(t => t.apply.map(a => a._id).indexOf(user) != -1)[0] || troc.tarif[0]
	let prefix = troc.trader.filter(t => t._id == user)[0]

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

module.exports = {
	findSpec,
    getFee,
    getMargin
}
