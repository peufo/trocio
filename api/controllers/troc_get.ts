import { RequestHandler } from 'express'
import mongoose, { FilterQuery } from 'mongoose'

import type { Troc, TrocUserResum } from '../../types'
import TrocModel from '../models/troc'
import Article from '../models/article'
import Payment from '../models/payment'
import Subscribe from '../models/subscribe'
import { findSpec, lookupIfAdmin } from './troc_utils'

const { ObjectId } = mongoose.Types

export async function userIsAdminOfTroc(trocId: string, userId: string) {
  const subscribe = await Subscribe.findOne({
    troc: trocId,
    user: userId,
    role: 'admin',
  })
  if (!subscribe) throw new Error('User is not admin of troc')
  return !!subscribe
}

export async function userIsCashierOfTroc(trocId: string, userId: string) {
  const subscribe = await Subscribe.findOne({
    troc: trocId,
    user: userId,
    role: { $in: ['admin', 'cashier'] },
  })
  if (!subscribe) throw new Error('User is not cashier of troc')
  return !!subscribe
}

export async function userResume(
  trocId: string,
  userId: string
): Promise<TrocUserResum> {
  // TODO : Adapter la requete pour les client anonymes + pour des groupe
  // const userQuery = userId ? userId : { $exists: false }
  // LOOK AT ./scubscribe_get

  const userQuery = userId

  const providedResumPromise = Article.aggregate()
    .match({ troc: trocId, provider: userQuery })
    .project({
      price: true,
      feeValided: {
        valided: { $ifNull: ['$fee', 0] },
      },
      priceSold: {
        sold: { $ifNull: ['$price', 0] },
      },
      marginSold: {
        sold: { $ifNull: ['$margin', 0] },
      },
    })
    .group({
      _id: null,
      providedCount: { $sum: 1 },
      providedSum: { $sum: '$price' },
      feeSum: { $sum: '$feeValided' },
      soldSum: { $sum: '$priceSold' },
      marginSum: { $sum: '$marginSold' },
    })
    .exec()

  const purchasesResumPromise = Article.aggregate()
    .match({
      troc: trocId,
      buyer: userQuery,
    })
    .group({
      _id: null,
      purchasesCount: { $sum: 1 },
      purchasesSum: { $sum: '$price' },
    })
    .exec()

  const paymentsResumPromise = Payment.aggregate()
    .match({ troc: trocId, user: userQuery })
    .group({
      _id: null,
      paymentsCount: { $sum: 1 },
      paymentsSum: { $sum: '$amount' },
    })
    .exec()

  const [providedResum, purchasesResum, paymentsResum] = await Promise.all([
    providedResumPromise,
    purchasesResumPromise,
    paymentsResumPromise,
  ])

  /**
   * Récupère les valeurs ou attribut par défault
   */
  const {
    providedCount = 0,
    providedSum = 0,
    feeSum = 0,
    soldSum = 0,
    marginSum = 0,
  } = providedResum[0] || {}
  const { purchasesCount = 0, purchasesSum = 0 } = purchasesResum[0] || {}
  const { paymentsCount = 0, paymentsSum = 0 } = paymentsResum[0] || {}

  const balance =
    Math.round(
      (paymentsSum + soldSum - purchasesSum - feeSum - marginSum) * 100
    ) / 100

  return {
    troc: trocId,
    user: userId,
    balance,
    providedCount,
    providedSum,
    feeSum,
    soldSum,
    marginSum,
    purchasesCount,
    purchasesSum,
    paymentsCount,
    paymentsSum,
  }
}

/**
 * -----------------------------------------------
 */

/**
 * Retourne les spécifications d'un utilisateur sur un troc (tarif, prefix, role)
 */
export function getSpec(req, res, next) {
  const { trocId, userId } = req.query
  findSpec(trocId, userId, (err, spec) => {
    if (err) return next(err)
    res.json(spec)
  })
}

export function getStats(req, res, next) {
  const { trocId } = req.params
  const { userId, view } = req.query

  if (view === 'user' && !userId)
    return next(Error('Query userId is required when view=user'))

  TrocModel.findOne({ _id: trocId }).exec((err, troc) => {
    if (err || !troc) return next(err || Error('Troc not found'))

    let query: FilterQuery<Troc & Document> = { troc: troc._id }

    if (view === 'traders') {
      query.provider = { $in: troc.trader.map((t) => t.user) }
    } else if (view === 'privates') {
      query.provider = { $nin: troc.trader.map((t) => t.user) }
    } else if (view === 'user') {
      query.provider = userId
    }

    Article.find(query)
      .sort({ createdAt: 1 })
      .lean()
      .exec((err, articlesProposed) => {
        if (err) return next(err)

        if (view !== 'global') query.buyer = query.provider
        delete query.provider
        query.sold = { $exists: true }
        Article.find(query)
          .sort({ createdAt: 1 })
          .lean()
          .exec((err, articlesBuyed) => {
            if (err) return next(err)

            delete query.buyer
            delete query.sold
            if (view === 'user') query.user = userId
            Payment.find(query)
              .sort({ createdAt: 1 })
              .lean()
              .exec((err, payments) => {
                if (err) return next(err)
                res.json({ articlesProposed, articlesBuyed, payments })
              })
          })
      })
  })
}

export function search(req, res, next) {
  let {
    _id,
    search,
    skip = 0,
    limit = 20,
    start,
    end,
    north,
    east,
    sud,
    west,
  } = req.query

  let query: FilterQuery<Troc & Document> = {}

  if (_id) query = { _id }
  else {
    query = { is_try: false }

    if (search && search.length) {
      let regexp = new RegExp(search, 'i')
      query.$or = []
      query.$or.push({ name: regexp })
      query.$or.push({ description: regexp })
      query.$or.push({ address: regexp })
      query.$or.push({ society: regexp })
    }

    if (start || end || north || east || sud || west) query.$and = []

    if (start) query.$and.push({ 'schedule.close': { $gte: start } })
    if (end) query.$and.push({ 'schedule.open': { $lte: end } })
    if (!isNaN(north)) query.$and.push({ 'location.lat': { $lt: north } })
    if (!isNaN(east)) query.$and.push({ 'location.lng': { $lt: east } })
    if (!isNaN(sud)) query.$and.push({ 'location.lat': { $gt: sud } })
    if (!isNaN(west)) query.$and.push({ 'location.lng': { $gt: west } })
  }

  TrocModel.find(query)
    .skip(Number(skip))
    .limit(Number(limit))
    .lean({ virtuals: true })
    .exec((err, trocs) => {
      if (err) return next(err)
      res.json(trocs)

      // Admin and cashier becomes booleans + add subscribed boolean
      /*
      if (req.session.user) {
        Subscribe.find({
          user: req.session.user._id,
          troc: { $in: trocs.map((t) => t._id) },
        }).exec((err, subs) => {
          if (err) return next(err)
          subs = subs.map((s) => s.troc.toString())
          
          res.json(trocs)
        })
      } else {
        trocs.forEach((troc) => {
          delete troc.admin
          delete troc.cashier
        })
        
      }
      */
    })
}

export const getTroc: RequestHandler = async (req, res, next) => {
  const { trocId } = req.params

  const aggregate = TrocModel.aggregate().match({ _id: ObjectId(trocId) })

  /** Add user role */
  if (req.session.user) {
    aggregate
      .lookup({
        from: 'subscribes',
        let: { trocId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$troc', '$$trocId'] },
                  { $eq: ['$user', ObjectId(req.session.user._id)] },
                ],
              },
            },
          },
          {
            $project: { role: 1 },
          },
        ],
        as: 'subscribe',
      })
      .replaceRoot({
        $mergeObjects: [{ $arrayElemAt: ['$subscribe', 0] }, '$$ROOT'],
      })
      .project({ subscribe: 0 })
  }

  const trocs = await aggregate.exec()
  if (!trocs.length) return next(Error('Not found'))

  res.json(trocs[0])

  /**
   * TODO: REMOVE USAGE
   *
   * troc.isAdmin
   * troc.isCashier
   * troc.isSubscribed
   *
   */
}
