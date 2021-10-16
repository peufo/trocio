import Article from '../models/article'
import User from '../models/user'
import Troc from '../models/troc'

export function createArticleContext(articles, cb) {
  Troc.findOne({ _id: articles[0].troc }, (err, troc) => {
    if (err || !troc) return cb(err || Error('Troc is not found !'))
    if (troc.isClosed) return cb(Error('Troc is closed'))

    User.findOne(
      { _id: articles[0].provider || req.session.user._id },
      (err, user) => {
        if (err || !user) return cb(err || Error('Provider is not found !'))

        //Attribution d'une ref
        let newRef = troc.articlelastref + 1
        troc.articlelastref += articles.filter((art) => !art.ref).length
        troc.articles += articles.length
        troc.save((err) => cb(err, newRef, troc, user))
      }
    )
  })
}
/**
 * @deprecated Please use import { getRole } from '../controllers/troc_get'
 */
export function getRoles(userId, art, cb) {
  //Verifie si l'utilisateur est caissier ou admin
  Troc.findOne({ _id: art.troc }, { admin: 1, cashier: 1 }, (err, troc) => {
    // TODO: Pas très efficient
    if (err || !troc) return cb(err || Error('troc not found !'))
    let roles = []
    let isAdmin = troc.admin.map((a) => a.toString()).indexOf(userId) != -1
    let isCashier = troc.cashier.map((a) => a.toString()).indexOf(userId) != -1
    let isProvider = art.provider.toString() == userId

    if (isAdmin) roles.push('admin')
    if (isCashier || isAdmin) roles.push('cashier')
    if (isProvider) roles.push('provider')

    return cb(null, roles)
  })
}

export default {
  createArticleContext,
  getRoles,
}
