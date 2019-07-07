var express = require('express')
var Article = require('../models/article')
var { createArticle, deleteArticle } = require('../controllers/article')
var ObjectId = require('mongoose').Types.ObjectId
var router = express.Router()

router
	.get('/', (req, res, next) => {
		Article.find(req.query, (err, articles) => {
			if (err) return next(err)
			res.json(articles)
		})
	})
	.post('/', createArticle)
	.delete('/:id', deleteArticle)
	.get('/:id', (req, res, next) => {
		Article.findById(req.params.id, (err, art) => {
			if (err) return next(err)
			res.json(art)

		})
	})
	.patch('/', (req, res, next) => {
		var ids = req.body.map(a => a._id)
		Article.find({_id: {$in: ids}}, (err, articles) => {
			if (err || !articles.length) return next(err || Error('Article not found'))
			var errors = []
			articles.forEach(async art => {
				var patchedArt = req.body[ids.indexOf(String(art._id))]
				if (patchedArt._id) delete patchedArt._id
				for(p in patchedArt) art[p] = patchedArt[p]
				var err = await art.save()
				if (err) errors.push(err)
			})
			if (errors.length) return next(errors[0])
			res.json({success: true})
		})
	})
	.patch('/:id', (req, res, next) => {
		Article.findById(req.params.id, (err, art) => {
			if(err || !art) return next(err || Error('Article not found'))
			if (req.body._id) delete req.body._id
			for(p in req.body) art[p] = req.body[p]
			art.save(err => {
				if (err) return next(err)
				res.json(art)
			})
		})
	})

module.exports = router