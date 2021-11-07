import Article from '../models/article'
import mongoose, { Schema } from 'mongoose'
const { ObjectId } = Schema.Types

import { dynamicQuery } from './utils'
import { RequestHandler } from 'express'
import type { Article as IArticle } from '../../types'

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

export const getArticles: RequestHandler = async (req, res, next) => {
  let { exact_statut, include_without_name, limit, skip } = req.query

  let { match, sort } = dynamicQuery(req.query, ['exact_statut'])

  // add specific match
  if (!include_without_name) match.$and.push({ name: { $ne: '' } })

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

  const aggregate = Article.aggregate()
    .match(match)
    .skip(+skip || 0)
    .limit((+limit || 40) > 100 ? 100 : +limit || 40)

  if (Object.keys(sort).length) aggregate.sort(sort)

  lookupUsers(aggregate)
  lookupProviderSubscribe(aggregate)

  const articles = await aggregate.exec()
  res.json(articles)
}

/**
 * Update aggregate for lookup troc from trocId
 */
export function lookupUsers(aggregate: mongoose.Aggregate<IArticle[]>): void {
  const populate = (key: string) => ({
    from: 'users',
    let: { userId: `$${key}Id` },
    pipeline: [
      {
        $match: {
          $expr: {
            $eq: ['$$userId', '$_id'],
          },
        },
      },
      {
        $project: { name: 1 },
      },
    ],
    as: `${key}`,
  })

  aggregate
    .lookup(populate('provider'))
    .lookup(populate('validator'))
    .lookup(populate('seller'))
    .lookup(populate('buyer'))
    .addFields({
      provider: { $arrayElemAt: ['$provider', 0] },
      validator: { $arrayElemAt: ['$validator', 0] },
      seller: { $arrayElemAt: ['$seller', 0] },
      buyer: { $arrayElemAt: ['$buyer', 0] },
    })
}

/**
 * Update aggregate for lookup subscribe of provider
 */
export function lookupProviderSubscribe(
  aggregate: mongoose.Aggregate<IArticle[]>
): void {
  aggregate
    .lookup({
      from: 'subscribes',
      let: { subId: '$providerSubId' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$subId', '$_id'],
            },
          },
        },
        {
          $project: { name: 1 },
        },
      ],
      as: 'providerSub',
    })
    .addFields({
      providerSub: { $arrayElemAt: ['$providerSub', 0] },
    })
}
