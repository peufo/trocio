var Article = require('../models/article')
var Troc = require('../models/troc')

function createArticle(req, res, next) {
	if (!Array.isArray(req.body)) {
		var art = new Article(req.body)

		Troc.findOne({_id: art.troc}, (err, troc) => {
			if (err) return next(err)
			art.ref = ++troc.articlelastref //Reference
			troc.save(err => {
				if (err) return next(err)
				art.save(err => {
					if (err) return next(err)
					res.json({success: true, message: art})
				})				
			})
		})
	}else{
		var articles = req.body

		Troc.findOne({_id: articles[0].troc}, (err, troc) => {
			if (err) return next(err)
			let lastRef = troc.articlelastref + 1 //Reference
			troc.articlelastref += articles.length

			troc.save(err => {
				if (err) return next(err)

				articles.forEach(art  => delete art._id)

				Promise.all(articles.map((art, i) => {
					return new Promise((resolve, reject) => {
						art = new Article(art)
						art.ref = lastRef + i
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
		})
	}
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
		art.remove(err => {
			if (err) return next(err)
			res.json({success: true, message: `Article ${req.params.id} is removed`})
		})
	})
}

module.exports = {
	createArticle,
	validArticle,
	deleteArticle
}