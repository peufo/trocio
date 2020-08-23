let Subscribe = require('../models/subscribe')

function createSubscribe(req, res, next) {
    let { troc } = req.body
    if (!req.session.user) return next(Error('Login is required'))
    if (!troc) return next(Error('Troc is required on body'))
    Subscribe.findOne({troc, user: req.session.user._id}).exec((err, sub) => {
        if (err || sub) return next(err || Error('Subscription already exist'))
        sub = new Subscribe({troc, user: req.session.user._id})
        sub.save(err => {
            if (err) return next(err)
            res.json({error: false, message: sub})
        })
    })
}

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

module.exports = {
    createSubscribe, 
    warrantedSubscribe
}