import type { RequestHandler } from 'express'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

import Subscribe from '../models/subscribe'
import type { ISubscribe } from '../../types'
import { dynamicQuery } from './utils'

export const getMySubscribes: RequestHandler = async (req, res, next) => {
  try {
    let { skip = 0, limit = 10 } = req.query
    skip = +skip
    limit = +limit

    if (!req.session.user) throw 'Login required'

    const aggregate = Subscribe.aggregate()
    aggregate.match({
      userId: new ObjectId(req.session.user._id),
    })

    lookupTroc(aggregate)

    const subscribes = await aggregate
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec()

    res.json(subscribes)
  } catch (error) {
    next(error)
  }
}

/**
 * Resum is compute and tarif is added by default
 */
export const getResum: RequestHandler = async (req, res, next) => {
  try {
    const { userId, trocId, subscribeId } = req.query
    if (
      typeof subscribeId !== 'string' &&
      (typeof userId !== 'string' || typeof trocId !== 'string')
    )
      throw 'Query "subscribeId" or "userId" and "trocId" are required'

    const match = subscribeId
      ? { _id: new ObjectId(subscribeId) }
      : {
          userId: new ObjectId(userId),
          trocId: new ObjectId(trocId),
        }

    const aggregate = Subscribe.aggregate()
    aggregate.match(match)
    lookupResum(aggregate)
    lookupTarif(aggregate)

    const subscribes = await aggregate.exec()
    res.json(subscribes[0])
  } catch (error) {
    next(error)
  }
}

export const getSubscribers: RequestHandler = async (req, res, next) => {
  let {
    trocId,
    skip = 0,
    limit = 10,
    q = '',
    includResum = false,
    includTarif = false,
  } = req.query
  try {
    if (typeof trocId !== 'string') throw 'Query "trocId" is required (string)'
    if (typeof q !== 'string') throw 'Query "q" need to be a string'

    const regexp = new RegExp(q, 'i')
    skip = Number(skip)
    limit = Number(limit)

    let { match, sort } = dynamicQuery(req.query)

    match.$and.push({ trocId: new ObjectId(trocId) })

    // remove match if is empty
    if (!match.$or.length) delete match.$or

    const aggregate = Subscribe.aggregate()
    aggregate.match(match)

    lookupUser(aggregate)
    aggregate.match({ $or: [{ 'user.name': regexp }, { 'user.name': regexp }] })

    if (includResum) {
      lookupResum(aggregate)
    }

    if (includTarif) lookupTarif(aggregate)

    // Ca fait mal au serveur
    if (Object.keys(sort).length) aggregate.sort(sort)

    const subscribes = await aggregate.skip(skip).limit(limit).exec()
    res.json(subscribes)
  } catch (error) {
    next(error)
  }
}

/**
 * Retourne le nombre de participant à un troc selon le rôle ou le tarif
 */
export const getSubscribersCount: RequestHandler = async (req, res, next) => {
  try {
    const { trocId } = req.query
    if (typeof trocId !== 'string') throw 'Query "trocId" is required (string)'
    let { match } = dynamicQuery(req.query)
    match.$and.push({ trocId })
    // remove match if is empty
    if (!match.$or.length) delete match.$or
    // @ts-ignore
    const count = await Subscribe.countDocuments(match)
    res.json(count)
  } catch (error) {
    next(error)
  }
}

/**
 * Update aggregate for lookup user from userId
 */
export function lookupUser(
  aggregate: mongoose.Aggregate<ISubscribe[]>,
  userId = '$userId'
): void {
  aggregate
    .lookup({
      from: 'users',
      let: { userId },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$userId'],
            },
          },
        },
        {
          $project: {
            name: 1,
            mail: 1,
          },
        },
      ],
      as: 'user',
    })
    .addFields({
      user: { $arrayElemAt: ['$user', 0] },
    })
}

/**
 * Update aggregate for lookup troc from trocId
 */
export function lookupTroc(
  aggregate: mongoose.Aggregate<ISubscribe[]>,
  trocId = '$trocId'
): void {
  const NOW = new Date()

  aggregate
    .lookup({
      from: 'trocs',
      let: { trocId },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$_id', '$$trocId'],
            },
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
            address: 1,
            location: 1,
            schedule: 1,
            society: 1,
            societyweb: 1,
            is_try: 1,
            subscriber: 1,
            open: { $min: `$schedule.open` },
            isClosed: { $gt: [NOW, { $max: `$schedule.close` }] },
          },
        },
      ],
      as: 'troc',
    })
    .addFields({
      troc: { $arrayElemAt: ['$troc', 0] },
    })
}

/**
 * Update aggregate for lookup tarif from troc
 */
export function lookupTarif(
  aggregate: mongoose.Aggregate<ISubscribe[]>,
  tarifId = '$tarifId'
): void {
  aggregate
    .lookup({
      from: 'trocs',
      let: { tarifId },
      pipeline: [
        {
          $unwind: {
            path: '$tarif',
          },
        },
        {
          $match: {
            $expr: {
              $eq: ['$$tarifId', '$tarif._id'],
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: '$tarif',
          },
        },
      ],
      as: 'tarif',
    })
    .addFields({
      tarif: { $arrayElemAt: ['$tarif', 0] },
    })
}

/**
 * Update aggregate for add user's resum from articles documents
 */
export function lookupResum(aggregate: mongoose.Aggregate<ISubscribe[]>): void {
  aggregate
    .lookup({
      from: 'articles',
      let: { subscribeId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$subscribeId', '$providerSubId'],
            },
          },
        },
        {
          $group: {
            _id: null,
            providedCount: { $sum: 1 },
            providedSum: { $sum: '$price' },
            feeSum: {
              $sum: {
                $cond: [{ $not: ['$valided'] }, 0, '$fee'],
              },
            },
            soldSum: {
              $sum: {
                $cond: [{ $not: ['$sold'] }, 0, '$price'],
              },
            },
            soldCount: {
              $sum: {
                $cond: [{ $not: ['$sold'] }, 0, 1],
              },
            },
            marginSum: {
              $sum: {
                $cond: [{ $not: ['$sold'] }, 0, '$margin'],
              },
            },
          },
        },
      ],
      as: 'providedResum',
    })
    .lookup({
      from: 'articles',
      let: { subscribeId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$subscribeId', '$buyerSubId'],
            },
          },
        },
        {
          $group: {
            _id: null,
            purchasesCount: { $sum: 1 },
            purchasesSum: { $sum: '$price' },
            purchases: { $push: '$$ROOT' },
          },
        },
      ],
      as: 'purchasesResum',
    })
    .lookup({
      from: 'payments',
      let: { subscribeId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ['$$subscribeId', '$userSubId'],
            },
          },
        },
        {
          $group: {
            _id: null,
            paymentsCount: { $sum: 1 },
            paymentsSum: { $sum: '$amount' },
            payments: { $push: '$$ROOT' },
          },
        },
      ],
      as: 'paymentsResum',
    })
    .addFields({
      resum: {
        $mergeObjects: [
          { $arrayElemAt: ['$providedResum', 0] },
          { $arrayElemAt: ['$purchasesResum', 0] },
          { $arrayElemAt: ['$paymentsResum', 0] },
        ],
      },
    })
    .addFields({
      'resum.balance': {
        $subtract: [
          {
            $sum: ['$resum.paymentsSum', '$resum.soldSum'],
          },
          {
            $sum: ['$resum.feeSum', '$resum.marginSum', '$resum.purchasesSum'],
          },
        ],
      },
    })
    .project({
      providedResum: 0,
      purchasesResum: 0,
      paymentsResum: 0,
    })
}
