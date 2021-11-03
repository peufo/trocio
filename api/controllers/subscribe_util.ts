import { ObjectId } from 'mongoose'
import Subscribe from '../models/subscribe'

export async function getRole(trocId: string, userId: string) {
  const subscribe = await Subscribe.findOne({
    trocId,
    userId,
  })
  return subscribe?.role || null
}

export async function getSubscribe(trocId: string, userId: string) {
  return await Subscribe.findOne({
    trocId,
    userId,
  })
}
