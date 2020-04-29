var Article = require('../models/article')
var User = require('../models/user')
var Troc = require('../models/troc')

function createArticleContext(articles, cb) {
	Troc.findOne({_id: articles[0].troc}, (err, troc) => {
		if (err || !troc) return cb(err || Error('Troc is not found !'))

		User.findOne({_id: articles[0].provider}, (err, user) => {
			if (err || !user) return cb(err || Error('Provider is not found !'))

			 //Attribution d'une ref
			let newRef = troc.articlelastref + 1
			troc.articlelastref += articles.filter(art => !art.ref).length

			if (user.trocs.indexOf(troc._id) == -1) {
				user.trocs.push(troc._id)
				troc.provider.push(user._id)
				user.save(err => {
					if (err) return cb(err)
					troc.save(err => cb(err, newRef, troc, user))
				})
			}else{
				troc.save(err => cb(err, newRef, troc, user))
			}
		})
	})
}

function getRoles(userId, art, cb) {

	//Verifie si l'utilisateur est caissier ou admin
	Troc.findOne({_id: art.troc}, {admin: 1, cashier: 1}, (err, troc) => { // TODO: Pas très efficient
		if (err || !troc) return cb(err || Error('troc not found !'))
		let roles = []
		let isAdmin = troc.admin.map(a => a.toString()).indexOf(userId) != -1
		let isCashier = troc.cashier.map(a => a.toString()).indexOf(userId) != -1
		let isProvider = art.provider.toString() == userId

		if (isAdmin) roles.push('admin')
		if (isCashier || isAdmin) roles.push('cashier')
		if (isProvider) roles.push('provider')

		return cb(roles)
	})
}

module.exports = {
	createArticleContext,
	getRoles
}