import { RequestHandler } from 'express'
import mongoose, { FilterQuery, Mongoose } from 'mongoose'

import type { Troc } from '../../types'
import TrocModel from '../models/troc'
import Article from '../models/article'
import Payment from '../models/payment'
import Subscribe from '../models/subscribe'

const { ObjectId } = mongoose.Types

export async function getRole(trocId: string, userId: string) {
  const subscribe = await Subscribe.findOne({
    troc: trocId,
    user: userId,
  })
  return subscribe?.role || null
}

/**
 * Return tous les infos nécéssaire au graphique
 */
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

  if (req.session.user) lookupRole(aggregate, req.session.user._id)

  const trocs = await aggregate.exec()
  res.json(trocs)
}

export const getTroc: RequestHandler = async (req, res, next) => {
  const { trocId } = req.params
  const aggregate = TrocModel.aggregate().match({ _id: ObjectId(trocId) })
  if (req.session.user) lookupRole(aggregate, req.session.user._id)
  const trocs = await aggregate.exec()
  if (!trocs.length) return next(Error('Not found'))
  res.json(trocs[0])
}

/**
 * Add user role from subscribe document
 */
function lookupRole(
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
                { $eq: ['$troc', '$$trocId'] },
                { $eq: ['$user', ObjectId(userId)] },
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
