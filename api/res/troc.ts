import type { RequestHandler } from 'express'
import { userResume } from '../controllers/troc_get'

export const resUserResume: RequestHandler = async (req, res, next) => {
  try {
    const { trocId, userId } = req.query
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
