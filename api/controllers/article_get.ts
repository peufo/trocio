import Article from '../models/article'
import { Schema } from 'mongoose'
const { ObjectId } = Schema.Types

export function getArticle(req, res, next) {
  Article.find({ _id: req.params.articleId }).exec((err, article) => {
    if (err) return next(Error(err))
    res.json(article)
  })
}

export function getProvidedArticles(req, res, next) {
  let {
    troc,
    provider = req.session.user._id,
    skip = 0,
    limit = 20,
  } = req.query

  skip = Number(skip)
  limit = Number(limit)

  Article.find({ troc, provider })
    .skip(skip)
    .limit(limit)
    .exec((err, article) => {
      if (err) return next(Error(err))
      res.json(article)
    })
}

export function getPurchasesArticles(req, res, next) {
  let { troc, buyer, seller, skip = 0, limit = 20 } = req.query
  if (!buyer) {
    // Client anonyme
    buyer = { $exists: false }
    if (!seller) seller = req.session.user._id
  }
  const query = seller ? { troc, buyer, seller } : { troc, buyer }

  Article.find(query)
    .skip(skip)
    .limit(limit)
    .exec((err, article) => {
      if (err) return next(Error(err))
      res.json(article)
    })
}

export function getGivbacksArticles(req, res, next) {
  const { troc, user, skip = 0, limit = 20 } = req.query
  const query = user
    ? { troc, 'giveback.user': user }
    : {
        troc,
        giveback: { $size: { $gt: 0 } },
        giveback: { $elemMatch: { user: { $exists: false } } },
      }

  Article.find(query)
    .skip(skip)
    .limit(limit)
    .exec((err, article) => {
      if (err) return next(Error(err))
      res.json(article)
    })
}

export function searchArticle(req, res, next) {
  const {
    troc,
    limit,
    skip,
    filter_statut,
    provider,
    providernot,
    include_without_name,
  } = req.query

  let match = {}
  let sort = {}
  const QUERY_SEARCH = 'search_'
  const QUERY_OR_SEARCH = 'or_search_'
  const QUERY_SORT = 'sort_'
  const QUERY_USER = 'user_'

  //addMatch
  match.$or = []
  match.$and = include_without_name ? [] : [{ name: { $ne: '' } }]

  if (troc) match.$and.push({ troc: ObjectId(troc) })

  //Filtre pour un groupe de founisseur
  if (provider) match.$and.push({ provider: { $in: provider } })
  if (providernot) match.$and.push({ provider: { $ne: providernot } })

  //Define skip
  skip = Number(skip)
  if (!skip) skip = 0

  //Define limit
  //TODO: Créer un échec du calcul du solde chez le client
  limit = Number(limit)
  if (!limit) limit = 40
  else if (limit > 100) limit = 100

  //Add filter statut
  switch (filter_statut) {
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

  //Dynamic query
  for (let key in req.query) {
    //add matchSearch
    if (key.indexOf(QUERY_SEARCH) === 0) {
      match.$and.push({
        [key.replace(QUERY_SEARCH, '')]: new RegExp(req.query[key], 'i'),
      })

      //add matchOrSearch
    } else if (key.indexOf(QUERY_OR_SEARCH) === 0) {
      match.$or.push({
        [key.replace(QUERY_OR_SEARCH, '')]: new RegExp(req.query[key], 'i'),
      })

      //add matchUser
    } else if (key.indexOf(QUERY_USER) === 0) {
      match.$and.push({ [key.replace(QUERY_USER, '')]: req.query[key] })

      //add sort
    } else if (key.indexOf(QUERY_SORT) != -1 && !isNaN(req.query[key])) {
      sort[key.replace(QUERY_SORT, '')] = Number(req.query[key])
    }
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
  filter_statut: ArticleState
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
