import Article from '../models/article'
import User from '../models/user'
import { Schema } from 'mongoose'
const { ObjectId } = Schema.Types

export function getArticle(req, res, next) {
  Article.find({ _id: req.params.articleId }).exec((err, article) => {
    if (err) return next(err)
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
      if (err) return next(err)
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
      if (err) return next(err)
      res.json(article)
    })
}

export function getGivbacksArticles(req, res, next) {
  const { troc, user, skip = 0, limit = 20 } = req.query
  const query = user
    ? { troc, 'giveback.user': user }
    : {
        troc,
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
    troc,
    limit,
    skip,
    exact_statut,
    provider,
    providernot,
    include_without_name,
  } = req.query

  let match = { $or: [], $and: [] }
  let sort = {}
  const QUERY_SEARCH = 'search_'
  const QUERY_OR_SEARCH = 'or_search_'
  const QUERY_USER_SEARCH = 'user_search_' // recherche dans les utilisateurs par nom ou par mail
  const QUERY_SORT = 'sort_'
  const QUERY_EXACT = 'exact_'
  const QUERY_FILTER_MIN = 'min_'
  const QUERY_FILTER_MAX = 'max_'

  // addMatch
  if (!include_without_name) match.$and = [{ name: { $ne: '' } }]

  if (troc) match.$and.push({ troc })

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

  // Dynamic query
  for (let key in req.query) {
    // prevent key already managed
    if (key === 'exact_statut') continue

    // add matchSearch
    if (key.startsWith(QUERY_SEARCH)) {
      match.$and.push({
        [key.replace(QUERY_SEARCH, '')]: new RegExp(req.query[key], 'i'),
      })

      // add matchOrSearch
    } else if (key.startsWith(QUERY_OR_SEARCH)) {
      match.$or.push({
        [key.replace(QUERY_OR_SEARCH, '')]: new RegExp(req.query[key], 'i'),
      })

      // add match user
    } else if (key.startsWith(QUERY_USER_SEARCH)) {
      const regexp = new RegExp(req.query[key], 'i')
      const users = await User.find(
        { $or: [{ name: regexp }, { mail: regexp }] },
        { _id: 1 }
      )
        .limit(40)
        .exec()
      match.$and.push({
        [key.replace(QUERY_USER_SEARCH, '')]: {
          $in: users.map((user) => user._id),
        },
      })

      // add match exact
    } else if (key.startsWith(QUERY_EXACT)) {
      match.$and.push({ [key.replace(QUERY_EXACT, '')]: req.query[key] })

      // Number and Date test
    } else if (
      !isNaN(req.query[key]) ||
      !isNaN(new Date(req.query[key]).getTime())
    ) {
      const value = req.query[key]

      // add sort
      if (key.startsWith(QUERY_SORT)) {
        sort[key.replace(QUERY_SORT, '')] = value

        // add filter min
      } else if (key.startsWith(QUERY_FILTER_MIN)) {
        match.$and.push({
          [key.replace(QUERY_FILTER_MIN, '')]: { $gte: value },
        })

        // add filter max
      } else if (key.startsWith(QUERY_FILTER_MAX)) {
        match.$and.push({
          [key.replace(QUERY_FILTER_MAX, '')]: { $lte: value },
        })
      }
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
