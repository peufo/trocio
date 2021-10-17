import { RequestHandler } from 'express'
import Subscribe from '../models/subscribe'
import Troc from '../models/troc'

export const createSubscribe: RequestHandler = async (req, res, next) => {
  try {
    const { trocId } = req.body
    if (!req.session.user) throw 'Login is required'
    if (!trocId) throw 'trocId string is required on body'

    // Verifie si un sub n'éxiste pas déjà
    const oldSubscribe = await Subscribe.findOne({
      trocId,
      userId: req.session.user._id,
    }).exec()
    if (oldSubscribe) throw 'Subscription already exist'

    const subscribe = new Subscribe({
      trocId,
      userId: req.session.user._id,
      validedByUser: true,
    })
    const troc = await Troc.findById(trocId).exec()
    if (!troc) throw 'Troc not found'
    troc.subscriber++
    await troc.save()
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
