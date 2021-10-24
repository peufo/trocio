import type { RequestHandler } from 'express'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

import Subscribe from '../models/subscribe'
import type { ISubscribe, RoleEnum } from '../../types'

export const getMySubscribes: RequestHandler = async (req, res, next) => {
  try {
    let { skip = 0, limit = 10 } = req.query
    skip = +skip
    limit = +limit

    if (!req.session.user) throw 'Login required'

    const aggregate = Subscribe.aggregate()
    aggregate.match({
      userId: ObjectId(req.session.user._id),
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
  const { userId, trocId } = req.query
  try {
    if (typeof userId !== 'string' || typeof trocId !== 'string')
      throw 'Query "userId" and "trocId" are required (string)'

    const aggregate = Subscribe.aggregate()
    aggregate.match({
      userId: ObjectId(userId),
      trocId: ObjectId(trocId),
    })
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
    filtredTarifs = [],
    exact_tarifId = '',
    includResum = false,
    includTarif = false,
    role = '',
  } = req.query
  const regexp = new RegExp(q, 'i')
  skip = Number(skip)
  limit = Number(limit)
  try {
    if (typeof trocId !== 'string') throw 'Query "trocId" is required (string)'
    if (typeof exact_tarifId !== 'string')
      throw 'Query "exact_tarifId" need to be a string'
    if (typeof role !== 'string') throw 'role query need to be a string'

    const match: any = {
      trocId: new ObjectId(trocId),
      tarifId: exact_tarifId
        ? ObjectId(exact_tarifId)
        : // @ts-ignore
          { $nin: filtredTarifs.map(ObjectId) },
    }
    if (role) match.role = role

    const aggregate = Subscribe.aggregate()
    aggregate.match(match)

    lookupUser(aggregate)
    aggregate.match({ $or: [{ 'user.name': regexp }, { 'user.name': regexp }] })

    if (includResum) {
      lookupResum(aggregate, '$user._id')
      // TODO: Add sort system for resum
    }

    if (includTarif) lookupTarif(aggregate)

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
    const { trocId, role = '', tarifId = '' } = req.query
    if (typeof trocId !== 'string') throw 'trocId string is required'
    if (typeof role !== 'string' && typeof tarifId !== 'string')
      throw 'role or tarifId need to be a string'

    const match: any = { trocId }
    if (role) match.role = role
    if (tarifId) match.tarifId = tarifId

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
export function lookupResum(
  aggregate: mongoose.Aggregate<ISubscribe[]>,
  userId = '$userId',
  trocId = '$trocId'
): void {
  const letTrocAndUser = { userId, trocId }
  const matchWith = (userField: 'user' | 'provider' | 'buyer') => ({
    $match: {
      $expr: {
        $and: [
          { $eq: ['$troc', '$$trocId'] },
          { $eq: [`$${userField}`, '$$userId'] },
        ],
      },
    },
  })

  aggregate
    .lookup({
      from: 'articles',
      let: letTrocAndUser,
      pipeline: [
        matchWith('provider'),
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
      let: letTrocAndUser,
      pipeline: [
        matchWith('buyer'),
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
      let: letTrocAndUser,
      pipeline: [
        matchWith('user'),
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
    .replaceRoot({
      $mergeObjects: [
        '$$ROOT',
        { $arrayElemAt: ['$providedResum', 0] },
        { $arrayElemAt: ['$purchasesResum', 0] },
        { $arrayElemAt: ['$paymentsResum', 0] },
      ],
    })
    .addFields({
      balance: {
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
