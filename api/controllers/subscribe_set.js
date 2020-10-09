let Subscribe = require('../models/subscribe')
let Troc = require('../models/troc')

async function createSubscribe(req, res, next) {
    let { troc } = req.body
    if (!req.session.user) return next(Error('Login is required'))
    if (!troc) return next(Error('Troc is required on body'))
    try {
        let subscribe = await Subscribe.findOne({troc, user: req.session.user._id}).exec()
        if (subscribe) throw 'Subscription already exist'
        subscribe = new Subscribe({troc, user: req.session.user._id})
        troc = await Troc.findById(troc).exec()
        if (!troc) throw 'Troc not found'
        troc.subscriber++
        troc.save()
        await subscribe.save()
        res.json({error: false, message: subscribe})
    } catch (error) {
        next(error)
    }
}
/*
function warrantedSubscribe(req, res, next) {
    let { troc } = req.query
    if (!req.session.user) return next(Error('Login is required'))
    if (!troc) return next(Error('Troc is required on query'))
    Subscribe.findOne({troc, user: req.session.user._id}).exec((err, sub) => {
        if (err) return next(err)
        if (sub) return next()
        sub = new Subscribe({troc, user: req.session.user._id})
        sub.save(err => {
            if (err) return next(err)
            next()
        })
    })
}
*/

module.exports = {
    createSubscribe
}