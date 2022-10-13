import type { RequestHandler } from 'express'
import mongoose from 'mongoose'
const { ObjectId } = mongoose.Types

import { lookupUser, populateUser } from './lookup'
import Subscribe from '../models/subscribe'
import User from '../models/user'
import Article from '../models/article'
import Payment from '../models/payment'
import type { ISubscribe, SubscribeLookup } from '../../types'
import { dynamicQuery } from './utils'
import { sumOfArticles } from './article_utils'

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
 * Récupère l'activité d'un participant
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
    lookupUser(aggregate)
    lookupTroc(aggregate)

    const [subscribe] = await aggregate.exec()
    res.json(subscribe)
  } catch (error) {
    next(error)
  }
}

/**
 * Retourne des chiffre clé du troc
 */
export const getResumCounts: RequestHandler = async (req, res, next) => {
  try {
    const { trocId } = req.query

    if (!mongoose.isValidObjectId(trocId) || typeof trocId !== 'string')
      throw 'trocId need to be a string'

    const match = { trocId: new ObjectId(trocId) }

    const aggregate = Subscribe.aggregate().match(match)
    lookupResum(aggregate)
    aggregate.group({
      _id: null,
      positiveCount: {
        $sum: { $cond: [{ $gt: ['$resum.balance', 0] }, 1, 0] },
      },
      positiveSum: {
        $sum: { $cond: [{ $gt: ['$resum.balance', 0] }, '$resum.balance', 0] },
      },
      negativeCount: {
        $sum: { $cond: [{ $lt: ['$resum.balance', 0] }, 1, 0] },
      },
      negativeSum: {
        $sum: { $cond: [{ $lt: ['$resum.balance', 0] }, '$resum.balance', 0] },
      },
      benefit: { $sum: { $add: ['$resum.feeSum', '$resum.marginSum'] } },
      benefitFee: { $sum: '$resum.feeSum' },
      benefitMargin: { $sum: '$resum.marginSum' },
    })

    const [resum] = await aggregate.exec()
    const [payment] = await Payment.aggregate()
      .match(match)
      .group({
        _id: null,
        paymentCount: { $sum: 1 },
        paymentSum: { $sum: '$amount' },
      })

    res.json({ ...resum, ...payment })
  } catch (error) {
    next(error)
  }
}

export const getResumePrintData: RequestHandler = async (req, res, next) => {
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

    res.json({
      subscribe,
      validedArticles,
      soldArticles,
      recoverArticles,
    })
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

    // Assure de filtrer sur le troc
    const initialMatch = {
      trocId: new ObjectId((exact_trocId || trocId) as string),
    }

    const aggregate = Subscribe.aggregate()
    aggregate.match(initialMatch)

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
    let { match, sort } = dynamicQuery(req.query)
    if (!match.$or?.length) delete match.$or
    if (!match.$and?.length) delete match.$and
    aggregate.match(match)
    if (Object.keys(sort).length) aggregate.sort(sort)

    const subscribes = await aggregate.skip(skip).limit(limit).exec()

    // Inclue la recherche au delà du troc si le nombre de subscribes est inférieur à la limite
    // TODO: skip ne peu pas fonctioner avec cette méthode...
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
    if (sub.validedByUser) return sub
    if (!sub.userId) return sub
    if (!sub.user?.mail) return sub
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
            societyMail: 1,
            societyPhone: 1,
            is_try: 1,
            subscriber: 1,
            open: { $min: `$schedule.open` },
            close: { $max: `$schedule.close` },
          },
        },
        {
          $addFields: {
            isClosed: { $gt: [NOW, '$close'] },
            isOpen: {
              $and: [{ $lt: [NOW, '$close'] }, { $gt: [NOW, '$open'] }],
            },
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
            articleCount: { $sum: 1 },
            proposedCount: sumOfArticles('proposed'),
            proposedSum: sumOfArticles('proposed', '$price'),
            validedCount: sumOfArticles('valided'),
            validedSum: sumOfArticles('valided', '$price'),
            refusedCount: sumOfArticles('refused'),
            feeSum: sumOfArticles('valided', '$fee'),
            soldCount: sumOfArticles('sold'),
            soldSum: sumOfArticles('sold', '$price'),
            marginSum: sumOfArticles('sold', '$margin'),
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
        { $sort: { sold: -1 } },
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
        { $sort: { createdAt: -1 } },
        { $lookup: populateUser('acceptor') },
        { $addFields: { acceptor: { $arrayElemAt: ['$acceptor', 0] } } },
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
