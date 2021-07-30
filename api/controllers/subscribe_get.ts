import Subscribe from '../models/subscribe'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

export function getMySubscribedTrocs(req, res, next) {
  let { skip = 0, limit = 10 } = req.query
  skip = Number(skip)
  limit = Number(limit)

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

export function getSubscriber(req, res, next) {
  let { trocId, skip = 0, limit = 10, q = '' } = req.query
  const regexp = new RegExp(q, 'i')
  skip = Number(skip)
  limit = Number(limit)
  if (!trocId) return next(Error('Query "trocId" is required'))

  const PROJECT_FIELDS = { createdAt: 1, updatedAt: 1, troc: 1 }

  Subscribe.aggregate()
    .match({ troc: new ObjectId(trocId) })
    .lookup({
      from: 'users',
      localField: 'user',
      foreignField: '_id',
      as: 'user',
    })
    .project({
      'user._id': { $arrayElemAt: ['$user._id', 0] },
      'user.name': { $arrayElemAt: ['$user.name', 0] },
      'user.mail': { $arrayElemAt: ['$user.mail', 0] },
      ...PROJECT_FIELDS,
    })
    .project({
      user: { $arrayElemAt: ['$user', 0] },
      ...PROJECT_FIELDS,
    })
    .match({ $or: [{ 'user.name': regexp }, { 'user.name': regexp }] })
    .skip(skip)
    .limit(limit)
    .exec(async (err, subscribes) => {
      if (err) return next(err)
      res.json(subscribes)
    })
}

export default { getMySubscribedTrocs, getSubscriber }
