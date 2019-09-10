var Article = require('../models/article')

function createArticle(req, res, next) {
	if (!Array.isArray(req.body)) {
		var art = new Article(req.body)
		Article.countDocuments({troc: art.troc}, (err, count) => {
			if (err) return next(err)
			art.ref = count
			art.save(err => {
				if (err) return next(err)
				res.json({success: true, message: art})
			})	
		})
	}else{
		Article.countDocuments({troc: req.body[0].troc}, (err, count) => {
			if (err) return next(err)

			req.body.forEach(art  => delete art._id)

			Promise.all(req.body.map((art, i) => {
				return new Promise((resolve, reject) => {
					art = new Article(art)
					art.ref = count + i
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