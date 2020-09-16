let Troc = require('../models/troc')
let Article = require('../models/article')
let Payment = require('../models/payment')
let Subscribe = require('../models/subscribe')
let { findSpec, lookupIfAdmin } = require('./troc_utils')

function getSpec(req, res, next) {
    let {troc, user} = req.query
    findSpec(troc, user, (err, spec) => {
        if (err) return next(err)
        res.json(spec)
    })
}

async function getDetails(req, res, next) {

	let { troc, user } = req.query
    if (!troc || !user) return next(Error('Troc and user query is required'))
    if (!req.session.user) return next(Error('Login is required'))
    
    try {

        if (user === 'undefined') {
            let purchasesPromise = Article.find({troc, sold: {$exists: true}, buyer: {$exists: false}, seller: req.session.user._id}).exec()
            let paymentsPromise  = Payment.find({troc, user: {$exists: false}, acceptor: req.session.user._id}).exec()
            let givbacksPromise  = Article.find({troc, giveback: {$size: {$gt: 0}}, giveback: {$elemMatch: {user: {$exists: false}}}}).exec()
            let specPromise      = findSpec(troc, user)
    
            let [
                purchases,
                payments,
                givebacks,
                { tarif }
            ] = await Promise.all([
                purchasesPromise,
                paymentsPromise,
                givbacksPromise,
                specPromise
            ])
            
            //Compute sum
            let buySum = purchases.length ? -purchases.map(a => a.price).reduce((acc, cur) => acc + cur) : 0
            let paySum = payments.length  ?  payments.map(a => a.amount).reduce((acc, cur) => acc + cur) : 0	
            let balance = Math.round((buySum + paySum) * 100) / 100
            
            res.json({
                troc,
                purchases,
                payments,
                givebacks,
                tarif,
                buySum, paySum, balance
            })

        }else{
            let providedPromise  = Article.find({troc, provider: user}).exec()
            let purchasesPromise = Article.find({troc, buyer: user}).exec()
            let givbacksPromise  = Article.find({troc, 'giveback.user': user}).exec()
            let paymentsPromise  = Payment.find({troc, user}).exec()
            let specPromise      = findSpec(troc, user)
    
            let [
                provided,
                purchases,
                givebacks,
                payments,
                {tarif, prefix}
            ] = await Promise.all([
                providedPromise,
                purchasesPromise,
                givbacksPromise,
                paymentsPromise,
                specPromise
            ])
            
            //Compute sum
            let buySum = purchases.length ? -purchases.map(a => a.price).reduce((acc, cur) => acc + cur) : 0
            let paySum = payments.length  ?  payments.map(a => a.amount).reduce((acc, cur) => acc + cur) : 0	
            let {soldSum, feeSum} = computeSum(provided)
            let balance = Math.round((buySum + paySum + soldSum + feeSum) * 100) / 100
            
            res.json({
                troc, user,
                provided,
                purchases,
                givebacks,
                payments,
                tarif, prefix,
                buySum, paySum, soldSum, feeSum, balance
            }) 

        }
        
    } catch (error) {
        next(error)
    }
}

function getStats(req, res, next) {
	Troc.findOne({_id: req.params.id}).exec((err, troc) => {
		if (err || !troc) return next(err || Error('Troc not found'))

		let query = {troc: troc._id}
		let user = req.query.user

		if (req.query.view == 'traders') {
			user = {$in: troc.trader.map(t => t.user)}
		}else if (req.query.view == 'privates') {
			user = {$nin: troc.trader.map(t => t.user)}
		}
		
		if (req.query.view != 'global' || user){
			query.provider = user
		}

		Article.find(query).sort({createdAt: 1}).lean().exec((err, articlesProposed) => {
			if (err) return next(err)

			delete query.provider
			if (user) query.buyer = user
			query.sold = {$exists: true}
			Article.find(query).sort({createdAt: 1}).lean().exec((err, articlesBuyed) => {
				if (err) return next(err)

				delete query.buyer
				delete query.sold
				if (user) query.user = user
				Payment.find(query).sort({createdAt: 1}).lean().exec((err, payments) => {
					if (err) return next(err)
					res.json({articlesProposed, articlesBuyed, payments})
				})
			})
		})

	})
}

function search(req, res, next) {
    let {search, skip = 0, start, end, north, east, sud, west} = req.query
    let query= {}

    if (search && search.length) {
        let regexp = new RegExp(search, 'i')
        query.$or = []
        query.$or.push({'name': regexp})
        query.$or.push({'description': 	regexp})
        query.$or.push({'address': 	regexp})
        query.$or.push({'society': 	regexp})
    }

    if (start || end || north || east || sud || west) query.$and = []

    if (start) 			query.$and.push({'schedule.close': {$gte: start}})
    if (end) 			query.$and.push({'schedule.open': {$lte: end}})
    if (!isNaN(north)) 	query.$and.push({'location.lat': {$lt: north}})
    if (!isNaN(east))  	query.$and.push({'location.lng': {$lt: east}})
    if (!isNaN(sud))   	query.$and.push({'location.lat': {$gt: sud}})
    if (!isNaN(west))  	query.$and.push({'location.lng': {$gt: west}})

    Troc.find(query).skip(Number(skip)).limit(20).lean().exec((err, trocs) => {
        if (err) return next(err)

        //Admin and cashier becomes booleans + add subscribed boolean
        if (req.session.user) {
            Subscribe.find({user: req.session.user._id, troc: {$in: trocs.map(t => t._id)}}).exec((err, subs) => {
                if (err) return next(err)
                subs = subs.map(s => s.troc.toString())
                let indexSubs = trocs.map(t => subs.indexOf(t._id.toString()))
                trocs.forEach((troc, i) => {
                    troc.isAdmin = troc.admin.map(a => a.toString()).indexOf(req.session.user._id.toString()) != -1
                    troc.isCashier = troc.cashier.map(c => c.toString()).indexOf(req.session.user._id.toString()) != -1
                    troc.isSubscribed = indexSubs[i] > -1
                })
                res.json(trocs)
            })
        }else{
            trocs.forEach(troc => {
                delete troc.admin
                delete troc.cashier
            })
            res.json(trocs)
        }
    })
}

function getTroc(req, res, next) {
    if (req.session.user) {
        Troc.findOne({_id: req.params.id}).lean().exec((err, troc) => {
            if (err || !troc) return next(err || Error('Not found'))
            lookupIfAdmin(troc, req.session.user._id.toString(), (err, troc) => {
                if (err || !troc) return next(err || Error('Not found'))
                res.json(troc)
            })
        })
    }else{
        Troc.findOne({_id: req.params.id}).lean().exec((err, troc) => {
            if (err || !troc) return next(err || Error('Not found'))
            delete troc.admin
            delete troc.cashier
            res.json(troc)
        })
    }
    
}

function computeSum(articles) {
	let soldSum = 0
	let feeSum = 0
	if (articles.length) {
		let arr = articles.filter(a => a.sold).map(a => a.price)
		soldSum = arr.length ? arr.reduce((acc, cur) => acc + cur) : 0
		arr = articles.filter(a => a.valided).map(a => a.fee)
		feeSum = arr.length ? -arr.reduce((acc, cur) => acc + cur) : 0
		arr = articles.filter(a => a.sold).map(a => a.margin)
		feeSum -= arr.length ? arr.reduce((acc, cur) => acc + cur) : 0
	}
	return {soldSum, feeSum}
}

module.exports = {
    getSpec,
    getDetails,
    getStats,
    search,
    getTroc
}
