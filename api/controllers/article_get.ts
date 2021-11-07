import Article from '../models/article'
import mongoose, { Schema } from 'mongoose'

import { dynamicQuery } from './utils'
import { RequestHandler } from 'express'
import type { Article as IArticle } from '../../types'

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
