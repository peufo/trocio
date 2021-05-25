let Subscribe = require('../models/subscribe')

function getMySubscribedTrocs(req, res, next) {
  let { skip = 0, limit = 10 } = req.query
  skip = Number(skip)
  limit = Number(limit)

  console.log({ skip, limit })

  if (!req.session.user)
    return res.json({ error: true, message: 'Login required' })
  Subscribe.find({ user: req.session.user._id })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(
      'troc',
      'name description address location admin cashier schedule society societyweb is_try subscriber'
    )
    .lean()
    .exec(async (err, subs) => {
      if (err) return next(err)

      //Admin and cashier becomes booleans
      let trocs = subs
        .map((sub) => {
          let { troc } = sub
          if (!troc) return null
          troc.isAdmin =
            troc.admin.map((a) => a.toString()).indexOf(req.session.user._id) !=
            -1
          troc.isCashier =
            troc.cashier
              .map((c) => c.toString())
              .indexOf(req.session.user._id) != -1
          if (!troc.isAdmin && !troc.isCashier)
            troc.admin = troc.cashier = undefined
          return troc
        })
        .filter(Boolean)

      res.json(trocs)
    })
}

module.exports = { getMySubscribedTrocs }
