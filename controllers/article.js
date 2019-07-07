var Article = require('../models/article')

function createArticle(req, res, next) {
	var art = new Article(req.body)
	art.save(err => {
		if (err) return next(err)
		res.json({success: true, message: art})
	})
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
	deleteArticle
}