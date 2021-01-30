let Subscribe = require('../models/subscribe')

function getMySubscribedTrocs(req, res, next) {
    let { limit = 10, skip = 0 } = req.query
    limit = Number(limit)
    skip = Number(skip)

    console.log({skip, limit})

    if (!req.session.user) return res.json({error: true, message: 'Login required'})
    Subscribe.find({user: req.session.user._id})
    .sort({updatedAt: -1}).skip(skip).limit(limit)
    .populate('troc', 'name description address location admin cashier schedule society societyweb is_try subscriber')
    .lean()
    .exec(async (err, subs) => {
        if (err) return next(err)

        //TODO: comprendre d'ou viennent les subscribes de troc inéxistant.
        //Remove subscribe inconnu
        let nbUnknownTrocs = 0
        await Promise.all(subs.map(sub => {
            if (!!sub.troc) return Promise.resolve()
            nbUnknownTrocs++
            return Subscribe.findByIdAndRemove(sub._id).exec()
        }))
        if (nbUnknownTrocs) console.log(`${nbUnknownTrocs} subscribe to unknow trocs removed`)

        //Admin and cashier becomes booleans
        let trocs = subs.map(sub => {
            let { troc } = sub
            if (!troc) return null
            troc.isAdmin = troc.admin.map(a => a.toString()).indexOf(req.session.user._id) != -1
            troc.isCashier = troc.cashier.map(c => c.toString()).indexOf(req.session.user._id) != -1
            if (!troc.isAdmin && !troc.isCashier) troc.admin = troc.cashier = undefined
            return troc
        }).filter(Boolean)

        res.json(trocs)

    })
}


module.exports = { getMySubscribedTrocs }
