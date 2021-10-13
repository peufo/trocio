/**
 * Middlewares gérant les interactions d'un participant avec un troc
 */

import type { RequestHandler, Request } from 'express'
import { getRole } from '../controllers/troc_get'

interface UserTroc {
  trocId: string
  userId: string
}

export const ensureUserIsAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.user._id) throw Error('Login required')
    const { trocId } = parseRequest(req)
    const role = await getRole(trocId, req.session.user._id)
    if (role === 'admin' || role === 'cashier') return next()
    throw 'User is not admin of troc'
  } catch (error) {
    return next(error)
  }
}

export const ensureUserIsCashier: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.user._id) return next(Error('Login required'))
    const { trocId } = parseRequest(req)
    const role = await getRole(trocId, req.session.user._id)
    if (role === 'cashier') return next()
    throw 'User is not cashier of troc'
  } catch (error) {
    return next(error)
  }
}

export const ensureUserIsSubscriber: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    if (!req.session.user._id) return next(Error('Login required'))
    const { trocId } = parseRequest(req)
    /* getRole throw error if not subscribe */
    const role = await getRole(trocId, req.session.user._id)
    if (!role) throw 'User is not subscribe of troc'
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

  const { trocId, userId } = parseRequest(req)
  const role = await getRole(trocId, userId)

  if (
    req.session.user?._id !== userId &&
    role !== 'admin' &&
    role !== 'cashier'
  ) {
    return next(Error(`User can't access to resum`))
  }

  return next()
}

/** S'assure également qu'il n'y a pas de diff entre les params */
function parseRequest(req: Request): UserTroc {
  /** Parse trocId */
  const trocIds = [req.params.trocId, req.body.trocId, req.query.trocId]
  const trocIdsUnique = trocIds.filter(Boolean).filter(beUnique)
  if (trocIdsUnique.length > 1)
    throw Error('Different trocId param is detected')
  const trocId = trocIdsUnique[0]

  /** Parse userId */
  const userIds = [req.params.userId, req.body.userId, req.query.userId]
  const userIdsUnique = userIds.filter(Boolean).filter(beUnique)
  if (userIdsUnique.length > 1)
    throw Error('Different userId param is detected')
  const userId = userIdsUnique[0]

  return { trocId, userId }
}

function beUnique(elem: any, index: number, self: any[]) {
  return self.indexOf(elem) === index
}
