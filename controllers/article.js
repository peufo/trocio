var Article = require('../models/article')
var User = require('../models/user')
var Troc = require('../models/troc')

function createArticle(req, res, next) {

	var articles = []
	if (!Array.isArray(req.body)) articles = [req.body]
	else articles = req.body

	createArticleContext(articles, (err, newRef) => {
		if (err) return next(err)
		
		articles.forEach(art  => delete art._id)
		
		let nbAttributedRef = 0
		Promise.all(articles.map(art => {
			return new Promise((resolve, reject) => {
				art = new Article(art)
				if (!art.ref) art.ref = newRef + nbAttributedRef++
				if (art.price === null) art.price = 0
				art.save(err => {
					if (err) return reject(err)
					else return resolve(art)
				})
			})
		}))			
		.catch(next)	
		.then(articles => {
			res.json({success: true, message: articles})
		})
	})
}

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


//Not used
function validArticle(req, res, next) {
	if(!Array.isArray(req.body)) {
		Article.findOne({_id: req.body._id}, (err, art) => {
			if (err || !art) return next(err || Error('Article not found'))
			art.valided = req.body.valided
			art.save(err => {
				if (err) return next(err)
				res.json({success: true, message: art})
			})
		})
	}else {
		var ids = req.body.map(a => a._id)
		Articles.find({_id: {$in: ids}}, (err, articles) => {
			if (err) next(err)
			Promise.all(articles.map(artUpdated => {
				return new Promise((resolve, reject) => {
					art.valided = artUpdated.valided
					art.save(err => {
						if (err) return reject(err)
						resolve(art)
					})	
				})
			}))
			.catch(next)
			.then(articles => {
				res.json({success: true, message: articles})
			})			
		})

	}
}

function deleteArticle(req, res, next) {
	Article.findOne({_id: req.params.id}, (err, art) => {
		if (err || !art) return next(err || Error('Article not found'))
		if (art.valided) return next(Error(`Valided article can't be delete`))
		art.remove(err => {
			if (err) return next(err)
			res.json({success: true, message: `Article ${req.params.id} is removed`})
		})
	})
}

function getAutorization(userId, art, cb) {

	//Verifie si l'utilisateur doit être caissier ou admin
	Troc.findOne({_id: art.troc}, {admin: 1, cashier: 1}, (err, troc) => { // TODO: Pas très efficient
		if (err || !troc) return cb(err || Error('troc not found !'))
		let isAdmin = troc.admin.map(a => a.toString()).indexOf(userId) != -1
		let isCashier = troc.cashier.map(a => a.toString()).indexOf(userId) != -1
		let isProvider = !art.valided && art.provider.toString() == userId

		if (isAdmin || isCashier) return cb(null, 'cashier')
		if (isProvider) return cb(null, 'provider')
		return cb(Error('Not authorized'))
		
	})
	
}

module.exports = {
	createArticle,
	validArticle,
	deleteArticle,
	getAutorization
}