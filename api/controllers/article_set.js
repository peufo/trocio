let Article = require('../models/article')
let User = require('../models/user')
let Troc = require('../models/troc')

let { getRoles, createArticleContext } = require('./article_utils')
let { findSpec, getFee, getMargin } = require('./troc_utils')
const article_utils = require('./article_utils')

function createArticle(req, res, next) {

	var articles = req.body
	if (!Array.isArray(articles)) articles = [articles]

	//TODO: verifier si le troc n'est pas dépasser

	createArticleContext(articles, async (err, newRef) => {
		if (err) return next(err)
		let { tarif } = await findSpec(articles[0].troc, articles[0].provider)

		articles.forEach(art  => delete art._id)
		
		let nbAttributedRef = 0
		Promise.all(articles.map(art => {
			return new Promise((resolve, reject) => {
				art = new Article(art)
				if (!art.ref) art.ref = newRef + nbAttributedRef++
				if (art.price === null) art.price = 0
				else {
					art.fee = getFee(art, tarif)
					art.margin = getMargin(art, tarif)
				}
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

function goBackArticle(req, res, next) {
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
}

function createNewPriceRequest(req, res, next) {
	let { _id, price } = req.body
	if (!_id || !price) return next(Error('_id and price are request'))

	Article.findOne({_id: _id}).exec((err, article) => {
		if (err || !article) return next(err || Error('Article not found'))

		getRoles(req.session.user._id, article, roles => {
			if (roles.indexOf('cashier') == -1) return next(Error('You need to be a cashier for this operation'))

			article.newPriceRequest = {
				applicant: req.session.user._id,
				createdAt: new Date(),
				price: price
			}

			article.save(err => {
				if (err) return next(err)
				res.json({success: true, message: 'New price request is created', data: article})
				//TODO: add Push notify to provider
			})
		})
	})
}

function acceptNewPriceRequest(req, res, next) {

	let { _id } = req.body
	if (!_id) return next(Error('_id is request'))
	Article.findOne({_id: _id}).exec((err, article) => {
		if (err) return next(err)

		getRoles(req.session.user._id, article, roles => {
			if (roles.indexOf('provider') == -1) return next(Error('You need to be a provider for this operation'))

			article.price = article.newPriceRequest.newPrice
			article.newPriceRequest = undefined

			article.save(err => {
				if (err) return next(err)
				res.json({success: true, message: 'New price request is accepted', data: article})

			})

		})

	})
}

function patchArticle(req, res, next) {

	let patchedArticles = req.body
	if (!Array.isArray(req.body)) patchedArticles = [patchedArticles]
	let errors = []
	let ids = patchedArticles.map(a => a._id)
	let uniqueTroc = false
	let uniqueProvider = false

	Article.find({_id: {$in: ids}}).exec((err, articles) => {
		if (err || !articles.length) return next(err || Error('Articles not found'))

		//Check if all articles become from the same troc
		uniqueTroc = articles.map(a => a.troc.toString()).filter((v, i, self) => self.indexOf(v) === i).length == 1
		if (!uniqueTroc) return next(Error('All articles not becomes from the same troc'))

		getRoles(req.session.user._id, articles[0], async roles => {

			if (!roles.length) return next(Error('Not authorized'))

			if (roles.indexOf('provider') != -1) {

				//Check if all articles become from the same provider
				uniqueProvider = articles.map(a => a.provider.toString()).filter((v, i, self) => self.indexOf(v) === i).length == 1
				if (!uniqueProvider) return next(Error('All articles not becomes from the same provider'))

				//Find tarif to apply it if price change
				let { tarif } = await findSpec(articles[0].troc, articles[0].provider)
					//if (err) return next(Error(err))

				articles = articles.map(art => {
					let patchedArt = patchedArticles[ids.indexOf(String(art._id))]
					let err = undefined

					//Check if the user is the provider (roles is not define for all articles)
					if (req.session.user._id != art.provider || req.session.user._id != art.provider._id) {
						err = Error('Provider not identified')
					}

					//PATCH
					if (!art.valided) {
						if (patchedArt.name) art.name = patchedArt.name
						if (!isNaN(patchedArt.price) && patchedArt.price !== null){
							art.price 	= patchedArt.price
							art.fee 	= getFee(art, tarif)
							art.margin 	= getMargin(art, tarif)
						}
					}

					if (err) errors.push(err)
					return art
				})
					

					
				

			}
			
			if(roles.indexOf('cashier') != -1) {
				articles = articles.map(art => {
					let patchedArt = patchedArticles[ids.indexOf(String(art._id))]

					let validedPatched = patchedArt.valided && patchedArt.valided != art.valided
					let refusedPatched = patchedArt.refused && patchedArt.refused != art.refused
					let soldPatched = patchedArt.sold && patchedArt.sold != art.sold
					let recoverPatched = patchedArt.recover && patchedArt.recover != art.recover

					//PATCH
					if (patchedArt.name) 	art.name 	= patchedArt.name
					if (patchedArt.valided) art.valided = patchedArt.valided
					if (patchedArt.refused) art.refused = patchedArt.refused
					if (patchedArt.sold) 	art.sold 	= patchedArt.sold
					if (patchedArt.recover) art.recover = patchedArt.recover
					if (patchedArt.buyer) 	art.buyer 	= patchedArt.buyer

					if (validedPatched || refusedPatched) art.validator = req.session.user._id
					if (soldPatched || recoverPatched) art.seller = req.session.user._id 


					//Verification du status de l'article
					let err = undefined
					if (art.valided && art.refused) err = Error(`Un article ne peut pas être validé et refusé`)
					if (art.sold && art.recover) err = Error(`Un article ne peut pas être vendu et récupéré`)
					if (!art.valided && (art.sold || art.recover)) err = Error(`Un article doit être validé pour être vendu ou récupéré`)

					//if (!err) err = await art.save()
					if (err) errors.push(err)

					return art
				})

			}

			if (errors.length) return next(errors[0])

			Promise.all(articles.map(art => {
				return new Promise((resolve, reject) => {
					art.save(err => {
						if (err) return reject(err)
						else return resolve(art)
					})

				})
			}))
			.then(() => {
				if (Array.isArray(req.body)){
					res.json({success: true, message: articles})
				}else{
					res.json({success: true, message: articles[0]})
				}
			}).catch(next)

		})

	})
}

module.exports = {
	createArticle,
    deleteArticle,
	goBackArticle,
	createNewPriceRequest,
	acceptNewPriceRequest,
	patchArticle
}