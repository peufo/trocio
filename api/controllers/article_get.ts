import Article from '../models/article'
import mongoose from 'mongoose'

import { dynamicQuery } from './utils'
import { RequestHandler } from 'express'
import type { Article as IArticle } from '../../types'

const { ObjectId } = mongoose.Types

export const getArticles: RequestHandler = async (req, res, next) => {
  let { q, exact_statut, include_without_name, limit, skip } = req.query

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

  if (q && typeof q === 'string') {
    match.$and.push({
      $or: [{ name: new RegExp(q, 'i') }, { ref: new RegExp(q, 'i') }],
    })
  }

  //remove match if is empty
  if (match.$and.length === 0) delete match.$and
  if (match.$or.length === 0) delete match.$or

  const aggregate = Article.aggregate()
    .match(match)
    .skip(+skip || 0)
    .limit((+limit || 20) > 1000 ? 1000 : +limit || 20)

  if (Object.keys(sort).length) aggregate.sort(sort)

  lookupUsers(aggregate)
  lookupSubscribe(aggregate, 'provider')
  lookupSubscribe(aggregate, 'buyer')

  const articles = await aggregate.exec()
  res.json(articles)
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
 * Generic fun for lookup an user field
 */
const populateUser = (key: string) => ({
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
