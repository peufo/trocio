import { RequestHandler } from 'express'
import mongoose, { FilterQuery, Mongoose } from 'mongoose'

import type { Troc, Article as IArticle } from '../../types'
import TrocModel from '../models/troc'
import Article from '../models/article'
import Payment from '../models/payment'
import Subscribe from '../models/subscribe'

const { ObjectId } = mongoose.Types

/**
 * Return tous les infos nécéssaire au graphique
 * Très peu optimisé désolé
 */
export const getStats: RequestHandler = async (req, res, next) => {
  try {
    const { trocId, subscribeId, tarifId } = validIds(req.query)
    const subIds: string[] = []

    if (tarifId) {
      const subsWithTarif = await Subscribe.find({ tarifId }, { _id: 1 })
      console.log({ subsWithTarif })
      subIds.push(...subsWithTarif.map((doc) => doc._id.toString()))
    }

    if (subscribeId) subIds.push(subscribeId)

    if (subIds.length || tarifId) {
      const [articlesProposed, articlesBuyed, payments] = await Promise.all([
        Article.find({ providerSubId: { $in: subIds } }),
        Article.find({ buyerSubId: { $in: subIds } }),
        Payment.find({ userSubId: { $in: subIds } }),
      ])
      res.json({ articlesProposed, articlesBuyed, payments })
    } else {
      const [articlesProposed, articlesBuyed, payments] = await Promise.all([
        Article.find({ trocId }),
        Article.find({ trocId, sold: { $exists: true } }),
        Payment.find({ trocId }),
      ])
      res.json({ articlesProposed, articlesBuyed, payments })
    }
  } catch (error) {
    next(error)
  }
}

function validIds(ids: { [key: string]: unknown }): { [key: string]: string } {
  for (const [key, value] of Object.entries(ids)) {
    if (!value) continue
    if (typeof value !== 'string') throw new Error(`${key} need to be a string`)
    if (!mongoose.isValidObjectId(value))
      throw new Error(`${key} need to be a valid Id`)
  }
  return ids as { [key: string]: string }
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
 * Add computed fields from schedule
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
      isOpen: { $and: [{ $lt: [NOW, '$close'] }, { $gt: [NOW, '$open'] }] },
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
