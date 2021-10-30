import { RequestHandler } from 'express'
import Subscribe from '../models/subscribe'
import Troc from '../models/troc'

export const createSubscribe: RequestHandler = async (req, res, next) => {
  try {
    const { trocId } = req.body
    if (!req.session.user) throw 'Login is required'
    if (!trocId) throw 'trocId string is required on body'
    const troc = await Troc.findById(trocId).exec()
    if (!troc) throw 'Troc not found'

    const tarif = troc.tarif.find((t) => t.bydefault)

    // Verifie si un sub n'éxiste pas déjà
    const oldSubscribe = await Subscribe.findOne({
      trocId,
      userId: req.session.user._id,
    }).exec()
    if (oldSubscribe) throw 'Subscription already exist'

    const subscribe = new Subscribe({
      trocId,
      userId: req.session.user._id,
      validedByUser: true,
      tarifId: tarif._id,
    })
    troc.subscriber++
    await troc.save()
    await subscribe.save()
    res.json(subscribe)
  } catch (error) {
    next(error)
  }
}

export const assignRole: RequestHandler = async (req, res, next) => {
  try {
    const { trocId, userId, role, prefix } = req.body
    if (typeof trocId !== 'string') throw 'trocId string is required in body'
    if (typeof userId !== 'string') throw 'userId string is required in body'
    if (typeof role !== 'string') throw 'role string is required in body'

    const subscribe = await Subscribe.findOne({ trocId, userId }).exec()
    // @ts-ignore
    subscribe.role = role

    if (role === 'trader') {
      subscribe.prefix = prefix || (await findNewPrefix(trocId))
    }

    await subscribe.save()
    res.json(subscribe)
  } catch (error) {
    next(error)
  }
}

export const assignTarif: RequestHandler = async (req, res, next) => {
  try {
    const { trocId, userId, tarifId } = req.body
    if (typeof trocId !== 'string') throw 'trocId string is required in body'
    if (typeof userId !== 'string') throw 'userId string is required in body'
    if (typeof tarifId !== 'string') throw 'tarifId string is required in body'

    const subscribe = await Subscribe.findOne({ trocId, userId }).exec()
    subscribe.tarifId = tarifId

    await subscribe.save()
    res.json(subscribe)
  } catch (error) {
    next(error)
  }
}

export const setTraderPrefix: RequestHandler = async (req, res, next) => {
  try {
    const { trocId, userId, prefix } = req.body
    if (typeof trocId !== 'string') throw 'trocId string is required in body'
    if (typeof userId !== 'string') throw 'userId string is required in body'
    if (typeof prefix !== 'string') throw 'prefix string is required in body'

    const subscribe = await Subscribe.findOne({ trocId, userId }).exec()
    subscribe.prefix = prefix
    await subscribe.save()
    res.json(subscribe)
  } catch (error) {
    next(error)
  }
}

async function findNewPrefix(trocId: string) {
  const tradersSubscribes = await Subscribe.find(
    { trocId, role: 'trader' },
    { prefix: 1 }
  )
  let prefixs = tradersSubscribes.map(({ prefix }) => prefix)
  let char = ''
  for (let i = 65; i < 91; i++) {
    char = String.fromCharCode(i)
    if (prefixs.indexOf(char) == -1) break
  }
  return char
}
