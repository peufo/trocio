import type { RequestHandler } from 'express'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types
require('svelte/register')

import Subscribe from '../models/subscribe'
import User from '../models/user'
import Article from '../models/article'
import type { ISubscribe, SubscribeLookup } from '../../types'
import { dynamicQuery } from './utils'
const ResumPdf = require('../lib/ResumPdf.svelte').default

export const getMySubscribes: RequestHandler = async (req, res, next) => {
  try {
    let { skip = 0, limit = 10 } = req.query
    skip = +skip
    limit = +limit

    if (!req.session.user) throw 'Login required'

    const aggregate = Subscribe.aggregate()
    aggregate.match({
      userId: new ObjectId(req.session.user._id),
      validedByUser: true,
      // validedByUser: false => invitations
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
    if (subscribeId && typeof subscribeId !== 'string')
      throw 'subscribeId need to be a string'
    if (userId && typeof userId !== 'string') throw 'userId need to be a string'
    if (trocId && typeof trocId !== 'string') throw 'trocId need to be a string'
    if (subscribeId && (userId || trocId))
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
export const getResumePdf: RequestHandler = async (req, res, next) => {
  try {
    const { subscribeId } = req.query
    if (typeof subscribeId !== 'string') throw 'subscribeId query is required'

    const aggregate = Subscribe.aggregate()
    aggregate.match({ _id: new ObjectId(subscribeId) })
    lookupResum(aggregate)
    lookupTarif(aggregate)
    lookupUser(aggregate)
    lookupTroc(aggregate)
    const [subscribe] = await aggregate.exec()
    if (!subscribe) throw 'subscribe not found'

    const articles = await Article.find({
      providerSubId: subscribeId,
      valided: { $exists: true },
    })

    const validedArticles = articles.filter((art) => !art.sold && !art.recover)
    const soldArticles = articles.filter((art) => art.sold)
    const recoverArticles = articles.filter((art) => art.recover)

    const { html } = ResumPdf.render({
      sub: subscribe,
      validedArticles,
      soldArticles,
      recoverArticles,
    })

    res.send(html)
  } catch (error) {
    next(error)
  }
}

export const getSubscribe: RequestHandler = async (req, res, next) => {
  try {
    res.json(res.locals.accessed)
  } catch (error) {
    next(error)
  }
}

export const getSubscribers: RequestHandler = async (req, res, next) => {
  let {
    trocId,
    exact_trocId,
    skip = 0,
    limit = 10,
    q = '',
    includResum = false,
    includTarif = false,
    /** Active une recherche d'utilisateur au delà du troc */
    includGlobalUser = false,
  } = req.query
  try {
    if (!trocId && !exact_trocId)
      throw 'Query "trocId" or exact_trocId is rquired'

    if (typeof q !== 'string') throw 'Query "q" need to be a string'

    skip = Number(skip)
    limit = Number(limit)

    let { match, sort } = dynamicQuery(req.query)

    // Assure de filtrer sur le troc
    // @ts-ignore
    if (!exact_trocId) match.$and.push({ trocId: new ObjectId(trocId) })

    // remove match $or if is empty
    if (!match.$or.length) delete match.$or

    const aggregate = Subscribe.aggregate()
    aggregate.match(match)

    lookupUser(aggregate)
    if (q)
      aggregate.match({
        $or: [
          { name: new RegExp(q, 'i') },
          { 'user.name': new RegExp(q, 'i') },
          { 'user.mail': new RegExp(q, 'i') },
        ],
      })

    if (includResum) {
      lookupResum(aggregate)
    }

    if (includTarif) lookupTarif(aggregate)

    // Ca fait mal au serveur 😁
    if (Object.keys(sort).length) aggregate.sort(sort)

    const subscribes = await aggregate.skip(skip).limit(limit).exec()

    // inclue la recherche au delà du troc si le nombre de subscribes est inférieur à la limite
    if (q && includGlobalUser && limit > subscribes.length) {
      const users = await User.aggregate()
        .match({
          _id: { $nin: subscribes.map((sub) => sub.userId) },
          $or: [{ name: new RegExp(q, 'i') }, { mail: new RegExp(q, 'i') }],
        })
        .limit(limit - subscribes.length)
        .project({
          _id: null,
          userId: '$_id',
          user: { _id: '$_id', name: '$name', mail: '$mail' },
        })
        .exec()

      res.json(hideMail([...subscribes, ...users]))
    } else {
      res.json(hideMail(subscribes))
    }
  } catch (error) {
    next(error)
  }
}

/**
 * Cache le mail d'un subscribe si il n'est pas validé pas un client
 */
function hideMail(subscribes: SubscribeLookup[]): SubscribeLookup[] {
  return subscribes.map((sub) => {
    if (sub.validedByUser || !sub.userId) return sub
    const index = sub.user.mail.indexOf('@')
    if (index > -1) {
      sub.user.mail = sub.user.mail.replace(
        sub.user.mail.slice(1, index - 1),
        '*'.repeat(index - 2)
      )
    } else {
      sub.user.mail = 'Invalid mail'
    }
    return sub
  })
}

/**
 * Retourne le nombre de participant à un troc selon le rôle ou le tarif
 */
export const getSubscribersCount: RequestHandler = async (req, res, next) => {
  try {
    let { match } = dynamicQuery(req.query)
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
            currency: 1,
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
