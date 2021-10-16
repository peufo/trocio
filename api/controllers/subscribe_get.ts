import type { RequestHandler } from 'express'

import Subscribe from '../models/subscribe'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

import type { ISubscribe } from '../../types'

export const getMySubscribes: RequestHandler = (req, res, next) => {
  let { skip = 0, limit = 10 } = req.query
  skip = Number(skip)
  limit = Number(limit)

  if (!req.session.user)
    return res.json({ error: true, message: 'Login required' })
  Subscribe.find({ user: req.session.user._id })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate(
      'troc',
      'name description address location schedule society societyweb is_try subscriber'
    )
    .lean()
    .exec(async (err, subscribes) => {
      if (err) return next(err)

      res.json(subscribes)
    })
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
      user: ObjectId(userId),
      troc: ObjectId(trocId),
    })
    lookupResum(aggregate)
    lookupTarif(aggregate)

    const subscribes = await aggregate.exec()
    res.json(subscribes[0])
  } catch (error) {
    next(error)
  }
}

export const getSubscriber: RequestHandler = async (req, res, next) => {
  let {
    trocId,
    skip = 0,
    limit = 10,
    q = '',
    filtredTarifs = [],
    exact_tarifId = '',
    includResum = false,
    includTarif = false,
  } = req.query
  const regexp = new RegExp(q, 'i')
  skip = Number(skip)
  limit = Number(limit)
  try {
    if (typeof trocId !== 'string') throw 'Query "trocId" is required (string)'
    if (typeof exact_tarifId !== 'string')
      throw 'Query "exact_tarifId" need to be a string'

    const tarifMatch = exact_tarifId
      ? ObjectId(exact_tarifId)
      : // @ts-ignore
        { $nin: filtredTarifs.map(ObjectId) }

    const aggregate = Subscribe.aggregate()
    aggregate.match({
      troc: new ObjectId(trocId),
      tarifId: tarifMatch,
    })

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
 * Replace user as id by user object {name, mail}
 */
function lookupUser(
  aggregate: mongoose.Aggregate<ISubscribe[]>,
  userId = '$user'
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
 * Lookup tarif from troc
 */
function lookupTarif(
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
 * Add user's resum from articles documents
 */
function lookupResum(
  aggregate: mongoose.Aggregate<ISubscribe[]>,
  userId = '$user',
  trocId = '$troc'
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
