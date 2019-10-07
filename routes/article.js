var express = require('express')
var Article = require('../models/article')
var { createArticle, deleteArticle } = require('../controllers/article')
var router = express.Router()

router
	.get('/', (req, res, next) => {

		if (req.query['buyer'] == 'false') req.query['buyer'] = { $exists: false }
		if (req.query['giveback.user'] == 'false') {
			req.query['giveback'] = {$ne: []}
			req.query['giveback.user'] = { $exists: false }
		}

		Article.find(req.query, (err, articles) => {
			if (err) return next(err)
			res.json(articles)
		})
	})
	.post('/', createArticle)
	.post('/giveback', (req, res, next) => {
		var errors = []
		var ids = req.body.map(a => a._id)
		Article.find({_id: {$in: ids}}, (err, articles) => {
			if (err || articles.length != req.body.length) return next(err || Error('Article not found'))
			console.log(articles);
			articles.forEach(async (art, index) => {
				art.giveback.push(req.body[index].giveback)
				art.sold = undefined
				art.buyer = undefined
				let err = await art.save()
				if (err) errors.push(err)
				return
			})
			if (errors.length) return next(errors[0])
			res.json({success: true, message: articles})
		})
	})
	.delete('/:id', deleteArticle)
	.get('/search', (req, res, next) => {
		let { search, troc, providernot, available } = req.query
		let query = {}

		if (troc || providernot || available) query.$and = []
		if (troc) query.$and.push({troc})
		if (providernot) query.$and.push({'provider': {$ne: providernot}})
		
		if (available) {
			query.$and.push({'valided': {$exists: true}})
			query.$and.push({'sold': {$exists: false}})
			query.$and.push({'recover': {$exists: false}})
		}

		if (search && search.length) {
			let regexp = new RegExp(search, 'i')
			query.$or = []
			query.$or.push({'name': regexp})
			query.$or.push({'ref': 	regexp})
		}
		
		Article.find(query).exec((err, articles) => {
			if (err) return next(err)
			res.json(articles)
		})

	})
	.get('/:id', (req, res, next) => {
		Article.findById(req.params.id, (err, art) => {
			if (err) return next(err)
			res.json(art)

		})
	})
	.patch('/', (req, res, next) => {
		var errors = []
		var ids = req.body.map(a => a._id)
		Article.find({_id: {$in: ids}}, (err, articles) => {
			if (err || !articles.length) return next(err || Error('Article not found'))
			articles.forEach(async art => {
				var patchedArt = req.body[ids.indexOf(String(art._id))]
				if (patchedArt._id) delete patchedArt._id
				for(p in patchedArt) art[p] = patchedArt[p]
				var err = await art.save()
				if (err) errors.push(err)
				return
			})
			if (errors.length) return next(errors[0])
			res.json({success: true, message: articles})
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