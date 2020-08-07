let Article = require('../models/article')
let Payment = require('../models/payment')
let { findSpec } = require('./troc_utils')

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
	getDetails
}
