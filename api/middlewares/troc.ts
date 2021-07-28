/**
 * Middlewares gérant les interactions d'un participant avec un troc
 */

import type { RequestHandler, Request } from 'express'
import {
  userIsAdminOfTroc,
  userIsCashierOfTroc,
  userResume,
} from '../controllers/troc_get'

interface UserTroc {
  trocId: string
  userId: string
}

export const ensureUserIsAdmin: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.user._id) throw Error('Login required')
    const { trocId } = parseRequest(req)
    await userIsAdminOfTroc(trocId, req.session.user._id)
    return next()
  } catch (error) {
    return next(error)
  }
}

export const ensureUserIsCashier: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.user._id) return next(Error('Login required'))
    const { trocId } = parseRequest(req)
    await userIsCashierOfTroc(trocId, req.session.user._id)
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
  if (
    req.session.user?._id !== userId &&
    !(await userIsCashierOfTroc(trocId, req.session.user._id))
  )
    return next(Error(`User can't access to resum`))
  return next()
}

function parseRequest(req: Request): UserTroc {
  const trocId = req.params.trocId || req.body.trocId || req.body.trocId
  const userId = req.params.userId || req.body.userId || req.body.userId
  return { trocId, userId }
}
