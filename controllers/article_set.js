var Article = require('../models/article')
var User = require('../models/user')
var Troc = require('../models/troc')

var { getRole, createArticleContext } = require('./article_utils')

function createArticle(req, res, next) {

	var articles = req.body
	if (!Array.isArray(articles)) articles = [articles]

	//TODO: verifier si le troc n'est pas dépasser

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

function patchArticle(req, res, next) {

	let patchedArticles = req.body
	if (!Array.isArray(patchedArticles)) patchedArticles = [patchedArticles]
	let errors = []
	let ids = patchedArticles.map(a => a._id)
	let uniqueTroc = false
	let uniqueProvider = 0

	//Verifie si les articles viennent tous du même troc
	uniqueTroc = patchedArticles.map(a => a.troc).filter((v, i, self) => self.indexOf(v) === i).length == 1
	if (!uniqueTroc) return next(Error('All articles not becomes from the same troc'))

	Article.find({_id: {$in: ids}}, (err, articles) => {
		if (err || !articles.length) return next(err || Error('Article not found'))

		getRole(req.session.user._id, articles[0], (err, role) => {
			if (err) return next(err)

			if (role == 'provider') {
				
				articles.forEach(async art => {
					let patchedArt = patchedArticles[ids.indexOf(String(art._id))]
					let err = undefined

					//Check if the user is the provider
					if (req.session.user._id == articles[0].provider || req.session.user._id == articles[0].provider._id) {
						err = Error('Provider not identified')
					}

					//PATCH
					if (!art.valided) {
						if (patchedArt.name) art.name = patchedArt.name
						if (!isNaN(patchedArt.price) && patchedArt.price !== null) art.price = patchedArt.price	
					}

					if (!err) err = await art.save()
					if (err) errors.push(err)
					return
				})

			}else if(role == 'cashier') {
				articles.forEach(async art => {
					let patchedArt = patchedArticles[ids.indexOf(String(art._id))]

					//PATCH
					if (patchedArt.name) art.name = patchedArt.name

					if (patchedArt.valided && patchedArt.valided != art.valided){
						art.valided = patchedArt.valided
						art.validator = req.session.user._id
					} 
					if (patchedArt.refused && patchedArt.refused != art.refused) {
						art.refused = patchedArt.refused
						art.validator = req.session.user._id 
					}
					if (patchedArt.sold && patchedArt.buyer && patchedArt.sold != art.sold) {
						art.sold = patchedArt.sold
						art.buyer = patchedArt.buyer
						art.seller = req.session.user._id 
					}
					if (patchedArt.recover && patchedArt.recover != art.recover) {
						art.recover = patchedArt.recover
						art.seller = req.session.user._id 
					}			

					//Verification du status de l'article
					let err = undefined
					if (art.valided && art.refused) err = Error(`Un article ne peut pas être validé et refusé`)
					if (art.sold && art.recover) err = Error(`Un article ne peut pas être vendu et récupéré`)
					if (!art.valided && (art.sold || art.recover)) err = Error(`Un article doit être validé pour être vendu et récupéré`)

					if (!err) err = await art.save()
					if (err) errors.push(err)
					return
				})

			}else {
				return next(Error('role unknow'))
			}

			if (errors.length) return next(errors[0])
			res.json({success: true, message: articles})

		})

	})
}

module.exports = {
	createArticle,
    deleteArticle,
    goBackArticle,
	patchArticle
}