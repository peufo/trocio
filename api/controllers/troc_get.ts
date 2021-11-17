import { RequestHandler } from 'express'
import mongoose, { FilterQuery, Mongoose } from 'mongoose'

import type { Troc } from '../../types'
import TrocModel from '../models/troc'
import Article from '../models/article'
import Payment from '../models/payment'
import Subscribe from '../models/subscribe'

const { ObjectId } = mongoose.Types

/**
 * Return tous les infos nécéssaire au graphique
 */
export const getStats: RequestHandler = async (req, res, next) => {
  try {
    const { trocId } = req.params
    const { subscribeId, view } = req.query

    if (view === 'subscribe' && !subscribeId)
      return next(Error('Query userId is required when view=user'))

    TrocModel.findOne({ _id: trocId }).exec((err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      let query: FilterQuery<Troc & Document> = { troc: troc._id }

      if (view === 'traders') {
        query.provider = { $in: troc.trader.map((t) => t.user) }
      } else if (view === 'privates') {
        query.provider = { $nin: troc.trader.map((t) => t.user) }
      } else if (view === 'subscribe') {
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
              if (view === 'subscribe') query.user = userId
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
  } catch (error) {
    next(error)
  }
}

export const search: RequestHandler = async (req, res, next) => {
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

  let matchQuery: FilterQuery<Troc & Document> = {}

  if (_id) matchQuery = { _id }
  else {
    matchQuery = { is_try: false }

    if (search && search.length) {
      let regexp = new RegExp(search, 'i')
      matchQuery.$or = []
      matchQuery.$or.push({ name: regexp })
      matchQuery.$or.push({ description: regexp })
      matchQuery.$or.push({ address: regexp })
      matchQuery.$or.push({ society: regexp })
    }

    if (start || end || north || east || sud || west) matchQuery.$and = []

    if (start)
      matchQuery.$and.push({ 'schedule.close': { $gte: new Date(start) } })
    if (end) matchQuery.$and.push({ 'schedule.open': { $lte: new Date(end) } })
    if (!isNaN(north)) matchQuery.$and.push({ 'location.lat': { $lt: +north } })
    if (!isNaN(east)) matchQuery.$and.push({ 'location.lng': { $lt: +east } })
    if (!isNaN(sud)) matchQuery.$and.push({ 'location.lat': { $gt: +sud } })
    if (!isNaN(west)) matchQuery.$and.push({ 'location.lng': { $gt: +west } })
  }

  const aggregate = TrocModel.aggregate()
    .match(matchQuery)
    .skip(Number(skip))
    .limit(Number(limit))

  addComputedFields(aggregate)

  if (req.session.user) lookupSubscribe(aggregate, req.session.user._id)

  const trocs = await aggregate.exec()
  res.json(trocs)
}

export const getTroc: RequestHandler = async (req, res, next) => {
  try {
    const { trocId } = req.query
    if (!trocId) throw 'query "trocId" is required'
    const aggregate = TrocModel.aggregate().match({ _id: new ObjectId(trocId) })
    if (req.session.user) lookupSubscribe(aggregate, req.session.user._id)
    addComputedFields(aggregate)
    const trocs = await aggregate.exec()
    if (!trocs.length) return next(Error('Not found'))
    res.json(trocs[0])
  } catch (error) {
    next(error)
  }
}

/**
 * Add computed fields
 */
export function addComputedFields(aggregate: mongoose.Aggregate<any[]>) {
  const NOW = new Date()
  aggregate
    .addFields({
      open: { $min: `$schedule.open` },
      close: { $max: `$schedule.close` },
    })
    .addFields({
      isClosed: { $gt: [NOW, '$close'] },
    })
}

/**
 * Add user role from subscribe document
 */
export function lookupSubscribe(
  aggregate: mongoose.Aggregate<Troc[]>,
  userId?: string
): void {
  aggregate
    .lookup({
      from: 'subscribes',
      let: { trocId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$trocId', '$$trocId'] },
                { $eq: ['$userId', new ObjectId(userId)] },
              ],
            },
          },
        },
      ],
      as: 'subscribe',
    })
    .addFields({
      subscribe: { $arrayElemAt: ['$subscribe', 0] },
    })
}

/**
 * Retourne le compte des subscribes et des articles proposé
 */
export const getTrocCounter: RequestHandler = async (req, res, next) => {
  try {
    const { trocId } = req.query
    if (!trocId) throw 'Query "trocId" is required'

    const [articlesCount, subscribesCount] = await Promise.all([
      Article.countDocuments({ trocId }),
      Subscribe.countDocuments({ trocId, validedByUser: true }),
    ])

    res.json({ articlesCount, subscribesCount })
  } catch (error) {
    next(error)
  }
}
