import Subscribe from '../models/subscribe'
import Troc from '../models/troc'

export async function createSubscribe(req, res, next) {
  let { troc } = req.body
  if (!req.session.user) return next(Error('Login is required'))
  if (!troc) return next(Error('Troc is required on body'))
  try {
    let subscribe = await Subscribe.findOne({
      troc,
      user: req.session.user._id,
    }).exec()
    if (subscribe) throw Error('Subscription already exist')
    subscribe = new Subscribe({ troc, user: req.session.user._id })
    troc = await Troc.findById(troc).exec()
    if (!troc) throw Error('Troc not found')
    troc.subscriber++
    troc.save()
    await subscribe.save()
    res.json(subscribe)
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

export default {
  createSubscribe,
}
