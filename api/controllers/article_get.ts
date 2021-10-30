import Article from '../models/article'
import User from '../models/user'
import { Schema } from 'mongoose'
const { ObjectId } = Schema.Types

import { dynamicQuery } from './utils'

export function getArticle(req, res, next) {
  Article.find({ _id: req.params.articleId }).exec((err, article) => {
    if (err) return next(err)
    res.json(article)
  })
}

/** @deprecated use searchArticle */
export function getProvidedArticles(req, res, next) {
  let {
    trocId,
    providerId = req.session.user._id,
    search = '',
    skip = 0,
    limit = 20,
  } = req.query

  skip = Number(skip)
  limit = Number(limit)
  const reg = new RegExp(search, 'i')

  Article.find({
    troc: trocId,
    provider: providerId,
    $or: [{ ref: reg }, { name: reg }],
  })
    .skip(skip)
    .limit(limit)
    .exec((err, article) => {
      if (err) return next(err)
      res.json(article)
    })
}

/** @deprecated use searchArticle */
export function getPurchasesArticles(req, res, next) {
  let { trocId, buyerId, sellerId, skip = 0, limit = 20 } = req.query
  if (!buyerId) {
    // Client anonyme
    buyerId = { $exists: false }
    if (!sellerId) sellerId = req.session.user._id
  }
  const query = sellerId
    ? { troc: trocId, buyer: buyerId, seller: sellerId }
    : { troc: trocId, buyer: buyerId }

  Article.find(query)
    .skip(skip)
    .limit(limit)
    .exec((err, article) => {
      if (err) return next(err)
      res.json(article)
    })
}

/** @deprecated use searchArticle */
export function getGivbacksArticles(req, res, next) {
  const { trocId, userId, skip = 0, limit = 20 } = req.query
  const query = userId
    ? { troc: trocId, 'giveback.user': userId }
    : {
        troc: trocId,
        giveback: {
          $and: [
            { $size: { $gt: 0 } },
            { $elemMatch: { user: { $exists: false } } },
          ],
        },
      }

  Article.find(query)
    .skip(skip)
    .limit(limit)
    .exec((err, article) => {
      if (err) return next(err)
      res.json(article)
    })
}

export async function searchArticle(req, res, next) {
  let {
    trocId,
    limit,
    skip,
    exact_statut,
    provider,
    providernot,
    include_without_name,
  } = req.query

  let { match, sort } = dynamicQuery(req.query, ['exact_statut'])

  // addMatch
  if (!include_without_name) match.$and.push({ name: { $ne: '' } })

  if (trocId) match.$and.push({ troc: trocId })

  // Filtre pour un groupe de founisseur
  if (provider) match.$and.push({ provider: { $in: provider } })
  if (providernot) match.$and.push({ provider: { $ne: providernot } })

  // Define skip
  skip = Number(skip)
  if (!skip) skip = 0

  //Define limit
  limit = Number(limit)
  if (!limit) limit = 40
  else if (limit > 100) limit = 100

  //Add filter statut
  switch (exact_statut) {
    case 'proposed':
      match.$and.push({ valided: { $exists: false } })
      match.$and.push({ refused: { $exists: false } })
      break
    case 'valided':
      match.$and.push({ valided: { $exists: true } })
      match.$and.push({ sold: { $exists: false } })
      match.$and.push({ recover: { $exists: false } })
      break
    case 'refused':
      match.$and.push({ refused: { $exists: true } })
      break
    case 'sold':
      match.$and.push({ sold: { $exists: true } })
      break
    case 'recover':
      match.$and.push({ recover: { $exists: true } })
      break
  }

  //remove match if is empty
  if (match.$and.length === 0) delete match.$and
  if (match.$or.length === 0) delete match.$or

  Article.find(match)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('provider', 'name')
    .populate('validator', 'name')
    .populate('seller', 'name')
    .populate('buyer', 'name')
    .exec((err, articles) => {
      if (err) return next(err)
      res.json(articles)
    })
}

/*
interface ArticleState {
  proposed: 'proposed'
  valided: 'valided'
  refused: 'refused'
  sold: 'sold'
  recover: 'recover'
}

interface SearchArticleQuery {
  troc: string
  limit: number
  skip: number
  exact_statut: ArticleState
  provider: string[]
  providernot: string[]
  include_without_name: boolean
}
*/

// TODO: migration from commonjs to ES6 typscript

export default {
  getArticle,
  getProvidedArticles,
  getPurchasesArticles,
  getGivbacksArticles,
  searchArticle,
}
