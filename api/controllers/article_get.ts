import mongoose from 'mongoose'
import type { RequestHandler } from 'express'

import Article from '../models/article'
import Subscribe from '../models/subscribe'
import { populateUser } from './lookup'
import { dynamicQuery } from './utils'
import type { Article as IArticle } from '../../types'
import { getMatchesByState, sumOfArticles } from './article_utils'

const { ObjectId } = mongoose.Types

export const getArticles: RequestHandler = async (req, res, next) => {
  try {
    let {
      q,
      exact_state,
      include_without_name,
      limit = 20,
      skip = 0,
    } = req.query

    let { match, sort } = dynamicQuery(req.query, {
      ignore: 'exact_state',
      cleanupMatch: false,
    })
    if (!match.$and || !match.$or) throw Error('never')

    // add specific match
    if (!include_without_name) match.$and.push({ name: { $ne: '' } })

    if (exact_state) match.$and.push(...getMatchesByState(exact_state))

    if (q && typeof q === 'string') {
      match.$and.push({
        $or: [{ name: new RegExp(q, 'i') }, { ref: new RegExp(q, 'i') }],
      })
    }

    //remove match if is empty
    if (match.$and.length === 0) delete match.$and
    if (match.$or.length === 0) delete match.$or

    const aggregate = Article.aggregate().match(match)

    if (Object.keys(sort).length) aggregate.sort(sort)
    else aggregate.sort({ createdAt: 1, index: 1 })

    aggregate
      .skip(+skip || 0)
      .limit((+limit || 20) > 10_000 ? 10_000 : +limit || 20)

    lookupUsers(aggregate)
    lookupSubscribe(aggregate, 'provider')
    lookupSubscribe(aggregate, 'buyer')

    const articles = await aggregate.exec()
    res.json(articles)
  } catch (error) {
    next(error)
  }
}

export const getArticleImportable: RequestHandler = async (req, res, next) => {
  try {
    const { subscribeId } = req.query
    if (!mongoose.isValidObjectId(subscribeId))
      throw Error('subscribeId need to be a valid objectId')

    const subscribe = await Subscribe.findById(subscribeId)

    const trocs = await Article.aggregate([
      {
        $match: {
          providerId: subscribe?.userId,
          $and: [
            { $or: [{ isCopied: false }, { isCopied: { $exists: false } }] },
            {
              $or: [
                { recover: { $exists: true } },
                { recover: { $exists: true } },
              ],
            },
          ],
        },
      },
      {
        $group: {
          _id: '$trocId',
          articles_count: { $sum: 1 },
          articles: {
            $push: {
              _id: '$_id',
              name: '$name',
              tagId: '$tagId',
              ref: '$ref',
              price: '$price',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'trocs',
          foreignField: '_id',
          localField: '_id',
          as: 'troc',
        },
      },
      {
        $addFields: {
          troc: { $arrayElemAt: ['$troc', 0] },
        },
      },
    ])

    res.json(trocs)
  } catch (error) {
    next(error)
  }
}

export const getArticleCountsByState: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { trocId } = req.query
    if (!mongoose.isValidObjectId(trocId))
      throw Error('trocId need to be a valid objectId')

    const [counts] = await Article.aggregate([
      { $match: { trocId: new ObjectId(trocId as string) } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          proposed: sumOfArticles('proposed'),
          refused: sumOfArticles('refused'),
          valided: sumOfArticles('valided'),
          sold: sumOfArticles('sold'),
          recover: sumOfArticles('recover'),
        },
      },
    ])

    // Si aucun article ne match
    const defaultCounts = {
      _id: null,
      total: 0,
      proposed: 0,
      refused: 0,
      valided: 0,
      sold: 0,
      recover: 0,
    }

    res.json(counts || defaultCounts)
  } catch (error) {
    next(error)
  }
}

/**
 * Effectue un loolkup sur les correction d'un article
 */
export const getArticleCorrection: RequestHandler = async (req, res, next) => {
  try {
    const { articleId } = req.query
    if (typeof articleId !== 'string') throw 'articleId query is required'

    const aggregate = Article.aggregate().match({
      _id: new ObjectId(articleId),
    })

    lookupCorrections(aggregate)

    const [article] = await aggregate.exec()

    res.json(article)
  } catch (error) {
    next(error)
  }
}

/**
 * Update aggregate for lookup troc from trocId
 */
export function lookupUsers(aggregate: mongoose.Aggregate<IArticle[]>): void {
  aggregate
    .lookup(populateUser('provider'))
    .lookup(populateUser('validator'))
    .lookup(populateUser('seller'))
    .lookup(populateUser('buyer'))
    .addFields({
      provider: { $arrayElemAt: ['$provider', 0] },
      validator: { $arrayElemAt: ['$validator', 0] },
      seller: { $arrayElemAt: ['$seller', 0] },
      buyer: { $arrayElemAt: ['$buyer', 0] },
    })
}

/**
 * Update aggregate for add author Name
 */
export function lookupCorrections(
  aggregate: mongoose.Aggregate<IArticle[]>
): void {
  aggregate
    .unwind('$corrections')
    .lookup(populateUser('corrections.author'))
    .addFields({
      'corrections.author': { $arrayElemAt: ['$corrections.author', 0] },
    })
    .group({
      _id: '$_id',
      corrections: {
        $push: '$corrections',
      },
    })
}

/**
 * Update aggregate for lookup subscribe of provider
 */
export function lookupSubscribe(
  aggregate: mongoose.Aggregate<IArticle[]>,
  key = 'provider'
): void {
  aggregate
    .lookup({
      from: 'subscribes',
      let: { subId: `$${key}SubId` },
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
      as: `${key}Sub`,
    })
    .addFields({
      [`${key}Sub`]: { $arrayElemAt: [`$${key}Sub`, 0] },
    })
}
