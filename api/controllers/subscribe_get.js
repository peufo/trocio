let Subscribe = require('../models/subscribe')

function getMySubscribedTrocs(req, res, next) {
    let { limit = 10, skip = 0 } = req.query
    limit = Number(limit)
    skip = Number(skip)
    if (!req.session.user) return res.json({error: true, message: 'Login required'})
    Subscribe.find({user: req.session.user._id})
    .sort({updatedAt: -1}).limit(limit).skip(skip)
    .populate('troc', 'name description address location admin cashier schedule society societyweb')
    .lean()
    .exec((err, subs) => {
        if (err) return next(err)

        //Admin and cashier becomes booleans
        let trocs = subs.map(sub => {
            let troc = sub.troc
            troc.isAdmin = troc.admin.map(a => a.toString()).indexOf(req.session.user._id) != -1
            troc.isCashier = troc.cashier.map(c => c.toString()).indexOf(req.session.user._id) != -1
            if (!troc.isAdmin && !troc.isCashier) troc.admin = troc.cashier = undefined
            return troc
        })

        res.json(trocs)

    })
}

module.exports = { getMySubscribedTrocs }
