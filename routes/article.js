var express = require('express')
var Article = require('../models/article')
var Troc = require('../models/troc')
var { createArticle, deleteArticle, getAutorization } = require('../controllers/article')
var { checkLogin } = require('../controllers/user')
var router = express.Router()

router
	.get('/', (req, res, next) => {

		if (req.query['buyer'] === 'false' || req.query['buyer'] === 'undefined') { //For anonyme client
			req.query['buyer'] = { $exists: false }
			if (req.session.user) req.query['seller'] = req.session.user._id
		}

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
		let { search, troc, provider, providernot, statut, limit, skip, pricesort } = req.query
		let query = {}
		let sort = {}

		//if (troc || providernot || available) query.$and = []
		query.$and = [{name : {$ne: ""}}] //not article without name
		if (troc) query.$and.push({troc})
		if (providernot) query.$and.push({'provider': {$ne: providernot}})
		if (provider) query.$and.push({'provider': {$in: provider}})

		switch (statut) {
			case 'proposed':
				query.$and.push({'valided': {$exists: false}})
				break
			case 'valided':
				query.$and.push({'valided': {$exists: true}})
				query.$and.push({'sold': {$exists: false}})
				query.$and.push({'recover': {$exists: false}})
				break
			case 'sold':
				query.$and.push({'sold': {$exists: true}})
				break	
			case 'recover':		
				query.$and.push({'recover': {$exists: true}})
				break
		}

		if (search && search.length) {
			let regexp = new RegExp(search, 'i')
			query.$or = []
			query.$or.push({'name': regexp})
			query.$or.push({'ref': 	regexp})
		}
		
		skip = Number(skip)
		limit = Number(limit)
		if (!skip) skip = 0
		if (!limit) limit = 40
		else if(limit > 100) limit = 100

		if (pricesort) {
			sort.price = pricesort
		}

		Article.find(query).populate('provider', 'name').sort(sort).skip(skip).limit(limit).exec((err, articles) => {
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
	.patch('/', checkLogin, (req, res, next) => {
		//Verifie si le les article vienne tous du même fournisseur
		var uniqueProvider = req.body.map(a => a.provider).filter((v, i, self) => self.indexOf(v) === i).length == 1
		if (!uniqueProvider) return next(Error('providor is not unique'))

		//Verifie si le les article vienne tous du même troc
		var uniqueTroc = req.body.map(a => a.troc).filter((v, i, self) => self.indexOf(v) === i).length == 1
		if (!uniqueTroc) return next(Error('All articles not becomes from the same troc'))

		var errors = []
		var ids = req.body.map(a => a._id)
		Article.find({_id: {$in: ids}}, (err, articles) => {
			if (err || !articles.length) return next(err || Error('Article not found'))

			getAutorization(req.session.user._id, articles[0], (err, authorization) => {
				if (err) return next(err)

				if (authorization == 'provider') {
					articles.forEach(async art => {
						var patchedArt = req.body[ids.indexOf(String(art._id))]
						if (patchedArt._id) delete patchedArt._id
						if (patchedArt.provider) delete patchedArt.provider

						//PATCH
						if (patchedArt.name) art.name = patchedArt.name
						if (!isNaN(patchedArt.price) && patchedArt.price !== null) art.price = patchedArt.price

						//TODO: Changer par un calcule interne
						if (patchedArt.fee) art.fee = patchedArt.fee
						if (patchedArt.margin) art.margin = patchedArt.margin

						var err = await art.save()
						if (err) errors.push(err)
						return
					})

				}else if(authorization == 'cashier') {
					articles.forEach(async art => {
						var patchedArt = req.body[ids.indexOf(String(art._id))]
						if (patchedArt._id) delete patchedArt._id
						if (patchedArt.provider) delete patchedArt.provider

						//Add author signature
						if (patchedArt.validator) delete patchedArt.validator
						if (patchedArt.seller) delete patchedArt.seller
						if (patchedArt.valided != art.valided || patchedArt.refused != art.refused) art.validator = req.session.user._id 
						if (patchedArt.sold != art.sold || patchedArt.recover != art.recover) art.seller = req.session.user._id 

						//PATCH
						for(p in patchedArt) art[p] = patchedArt[p]

						var err = await art.save()
						if (err) errors.push(err)
						return
					})

				}else {
					return next(Error('Authorization unknow'))
				}

				if (errors.length) return next(errors[0])
				res.json({success: true, message: articles})

			})

		})
	})
	.patch('/:id', checkLogin, (req, res, next) => {
		
		Article.findById(req.params.id, (err, art) => {
			if(err || !art) return next(err || Error('Article not found'))
			if (req.body._id) delete req.body._id
			if (req.body.provider) delete req.body.provider


			getAutorization(req.session.user._id, art, (err, authorization) => {
				if (err) return next(err)

				if (authorization == 'provider') {
					if (req.body.name) art.name = req.body.name
					if (req.body.price) art.price = req.body.price
					//TODO: Changer par un calcule interne
					if (req.body.fee) art.fee = req.body.fee
					if (req.body.margin) art.margin = req.body.margin

				}else if(authorization == 'cashier'){ //=> modification limiter au prix et au nom
					for(p in patchedArt) art[p] = patchedArt[p]

				}else{
					return next(Error('Authorization unknow'))
				}

				art.save(err => {
					if (err) return next(err)
					res.json({success: true, message: art})
				})
			})	
		})
	})

module.exports = router