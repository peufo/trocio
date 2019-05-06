var express = require('express')
var Article = require('../models/article')
var ObjectId = require('mongoose').Types.ObjectId
var router = express.Router()

router
	.get('/', (req, res, next) => {
		Article.aggregate([{$match: {}}], (err, art) => {
			if(!err){
				res.json(art)
			}else next()
		})
	})
	.post('/', (req, res) => {
		var art = new Article(req.body)
		art.save()
		res.status(201).json(art)
	})
	.get('/:id', (req, res, next) => {
		Article.findById(req.params.id, (err, art) => {
			if (!err) {
				res.json(art)
			}else next()
		})
	})
	.patch('/:id', (req, res, next) => {
		Article.findById(req.params.id, (err, art) => {
			if(!err && art){
				if (req.body._id) delete req.body._id
				for(p in req.body){art[p] = req.body[p]}
				art.save()
				res.json(art)
			}else next()
		})
	})

module.exports = router