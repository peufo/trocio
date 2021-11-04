/**
 * Middlewares gérant les interactions d'un participant avec un troc
 */

import type { RequestHandler, Request } from 'express'
import { getRole } from '../controllers/subscribe_util'
import Subscribe from '../models/subscribe'

interface SubscribeQuery {
  subscribeId: string
  trocId: string
  userId: string
}

export const ensureUserIsAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.user._id) throw Error('Login required')
    const { accessor } = await getAccessedAndAssecor(req)
    if (accessor.role !== 'admin') throw `User is not admin of troc`
    return next()
  } catch (error) {
    return next(error)
  }
}

export const ensureUserIsCashier: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.user._id) return next(Error('Login required'))

    const { accessor } = await getAccessedAndAssecor(req)
    if (accessor.role !== 'admin' && accessor.role !== 'cashier')
      throw `User is not admin of troc`

    return next()
  } catch (error) {
    return next(error)
  }
}

/**
 * L'utilisateur connecté peut accéder à un résumé si:
 * - Il est admin ou caissier du troc en question
 * - C'est sont propre résumé
 */
export const ensureUserCanAccessResum: RequestHandler = async (
  req,
  res,
  next
) => {
  if (!req.session.user._id) return next(Error('Login required'))
  const { accessed, accessor } = await getAccessedAndAssecor(req)
  if (
    accessed._id !== accessor._id &&
    accessor.role !== 'admin' &&
    accessor.role !== 'cashier'
  ) {
    throw `User can't access to resum`
  }

  return next()
}

async function getAccessedAndAssecor(req: Request) {
  try {
    const { subscribeId, trocId } = parseRequest(req)
    const accessed = subscribeId
      ? await Subscribe.findById(subscribeId)
      : await Subscribe.findOne({ trocId, userId: req.session.user._id })
    if (!accessed) throw 'Subscriber to edit not found'
    // accessor can eventualy be the accessed
    const accessor =
      String(accessed.userId) === String(req.session.user._id)
        ? accessed
        : await Subscribe.findOne({
            trocId: accessed.trocId,
            userId: req.session.user._id,
          })
    if (!accessor) throw 'Editor subscriber not found'
    return { accessed, accessor }
  } catch (error) {
    throw error
  }
}

/** S'assure également qu'il n'y a pas de diff entre les params */
function parseRequest(req: Request): SubscribeQuery {
  /** Parse subscribeId */
  const subscribeIds = [
    req.params.subscribeId,
    req.body.subscribeId,
    req.query.subscribeId,
    req.query.exact_subscribeId,
  ]
  const subscribeIdsUnique = subscribeIds.filter(Boolean).filter(beUnique)
  if (subscribeIdsUnique.length > 1)
    throw Error('Different subscribeId param is detected')
  const subscribeId = subscribeIdsUnique[0]

  /** Parse trocId */
  const trocIds = [
    req.params.trocId,
    req.body.trocId,
    req.query.trocId,
    req.query.exact_trocId,
  ]
  const trocIdsUnique = trocIds.filter(Boolean).filter(beUnique)
  if (trocIdsUnique.length > 1)
    throw Error('Different trocId param is detected')
  const trocId = trocIdsUnique[0]

  /** Parse userId */
  const userIds = [
    req.params.userId,
    req.body.userId,
    req.query.userId,
    req.query.exact_userId,
  ]
  const userIdsUnique = userIds.filter(Boolean).filter(beUnique)
  if (userIdsUnique.length > 1)
    throw Error('Different userId param is detected')
  const userId = userIdsUnique[0]

  return { trocId, userId, subscribeId }
}

function beUnique(elem: any, index: number, self: any[]) {
  return self.indexOf(elem) === index
}
