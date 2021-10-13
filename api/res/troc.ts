import type { RequestHandler } from 'express'

import { populateTrocUser } from '../controllers/troc_utils'

/**
 * Return populated lists
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
