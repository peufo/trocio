import type { RequestHandler } from 'express'
import { userResume } from '../controllers/troc_get'

import {
  lookupIfAdmin,
  populateTrocUser,
  scheduleValidation,
} from '../controllers/troc_utils'

export const resUserResume: RequestHandler = async (req, res, next) => {
  try {
    const { trocId, userId = req.session.user._id } = req.query
    if (typeof trocId !== 'string')
      throw Error('trocId query need to be a string')
    if (typeof userId !== 'string')
      throw Error('userId query need to be a string')
    const resume = await userResume(trocId, userId)
    res.json(resume)
  } catch (error) {
    next(error)
  }
}

/**
 * Return poplated lists
 */
export const resTrocUser: RequestHandler = async (req, res, next) => {
  try {
    const { trocId } = req.params
    const troc = await populateTrocUser(trocId)
    res.json(troc)
  } catch (error) {
    next(error)
  }
}
