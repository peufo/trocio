import type { RequestHandler, Request } from 'express'
import mongoose from 'mongoose'

import Payment from '../../models/payment'
import Subscribe from '../../models/subscribe'
import { lookupUser, populateUser } from '../lookup'
import { lookupSubscribe } from '../article_get'
import { getRole } from '../access'
import { dynamicQuery } from '../utils'

const { ObjectId } = mongoose.Types

const PAYMENTS_MAX = 10_000

export const getPayments: RequestHandler = async (req, res, next) => {
  try {
    const { subscribeId } = req.query

    // Sans participant : liste des paiements du troc entier
    if (subscribeId === undefined) return getTrocPayments(req, res, next)

    if (!req.session.user) throw 'Login required !'
    if (typeof subscribeId !== 'string') throw 'userSubId is required'

    const acceded = await Subscribe.findById(subscribeId)
    if (!acceded) throw 'acceded not found'

    const accesor = await Subscribe.findOne({
      userId: req.session.user._id,
      trocId: acceded.trocId,
    })
    if (!accesor) throw 'accesor not found'
    if (
      accesor._id.valueOf() !== subscribeId &&
      accesor.role !== 'admin' &&
      accesor.role !== 'cashier'
    )
      throw 'Not allowed'

    const payments = await Payment.aggregate()
      .match({
        userSubId: new ObjectId(subscribeId),
      })
      .lookup(populateUser('acceptor'))
      .lookup(populateUser('user'))
      .addFields({
        acceptor: { $arrayElemAt: ['$acceptor', 0] },
        user: { $arrayElemAt: ['$user', 0] },
      })

    res.json(payments)
  } catch (error) {
    next(error)
  }
}

/**
 * Vérifie que l'utilisateur est admin ou caissier du troc demandé
 */
async function ensureTrocAccess(req: Request) {
  const { exact_trocId } = req.query
  if (!req.session.user) throw 'Login required !'
  if (!exact_trocId || typeof exact_trocId !== 'string')
    throw 'exact_trocId query is required'

  const role = await getRole(exact_trocId, req.session.user._id)
  if (role !== 'admin' && role !== 'cashier') throw 'Not allowed'
}

function parseDate(value: unknown): Date | undefined {
  if (typeof value !== 'string' || !value) return
  const date = new Date(value)
  return isNaN(date.getTime()) ? undefined : date
}

/**
 * Construit le match et le sort d'une recherche de paiements d'un troc
 * Partagé par getTrocPayments et getPaymentsResum
 */
function buildPaymentsMatch(query: Request['query']) {
  const { exact_direction, min_createdAt, max_createdAt } = query

  let { match, sort } = dynamicQuery(query, {
    ignore: [
      'exact_direction',
      'min_createdAt',
      'max_createdAt',
      'skip',
      'limit',
    ],
    cleanupMatch: false,
  })
  if (!match.$and || !match.$or) throw Error('never')

  // dynamicQuery ne sait pas filtrer les dates (il les convertit en nombre)
  const minDate = parseDate(min_createdAt)
  const maxDate = parseDate(max_createdAt)
  if (minDate) match.$and.push({ createdAt: { $gte: minDate } })
  if (maxDate) match.$and.push({ createdAt: { $lte: maxDate } })

  // Montant positif : encaissé (client → troc), négatif : versé (troc → client)
  if (exact_direction === 'in') match.$and.push({ amount: { $gt: 0 } })
  if (exact_direction === 'out') match.$and.push({ amount: { $lt: 0 } })

  if (match.$and.length === 0) delete match.$and
  if (match.$or.length === 0) delete match.$or

  if (!Object.keys(sort).length) sort = { createdAt: -1 }

  return { match, sort }
}

const getTrocPayments: RequestHandler = async (req, res, next) => {
  try {
    await ensureTrocAccess(req)

    const { limit = 20, skip = 0 } = req.query
    const { match, sort } = buildPaymentsMatch(req.query)

    // Au plafond (export), on demande une ligne de plus pour détecter
    // un résultat qui serait tronqué au lieu de le couper en silence
    const reachMax = (+limit || 20) >= PAYMENTS_MAX
    const aggregate = Payment.aggregate()
      .match(match)
      .sort(sort)
      .skip(+skip || 0)
      .limit(reachMax ? PAYMENTS_MAX + 1 : +limit || 20)

    lookupUser(aggregate, 'user')
    lookupUser(aggregate, 'acceptor')
    lookupSubscribe(aggregate, 'user')

    const payments = await aggregate.exec()
    if (payments.length > PAYMENTS_MAX)
      throw Error(
        `public: Plus de ${PAYMENTS_MAX.toLocaleString('fr')} paiements correspondent aux filtres, affinez-les`
      )

    res.json(payments)
  } catch (error) {
    next(error)
  }
}

/**
 * Nombre et sommes des paiements correspondant aux filtres
 */
export const getPaymentsResum: RequestHandler = async (req, res, next) => {
  try {
    await ensureTrocAccess(req)

    const { match } = buildPaymentsMatch(req.query)

    const [resum] = await Payment.aggregate()
      .match(match)
      .group({
        _id: null,
        count: { $sum: 1 },
        sum: { $sum: '$amount' },
        sumIn: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
        sumOut: { $sum: { $cond: [{ $lt: ['$amount', 0] }, '$amount', 0] } },
      })
      .project({ _id: 0 })

    res.json(resum || { count: 0, sum: 0, sumIn: 0, sumOut: 0 })
  } catch (error) {
    next(error)
  }
}
