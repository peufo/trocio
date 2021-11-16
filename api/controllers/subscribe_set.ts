import { RequestHandler } from 'express'
import randomize from 'randomatic'

import type { ISubscribe } from '../../types'
import Subscribe from '../models/subscribe'
import Troc from '../models/troc'

export const createSubscribe: RequestHandler = async (req, res, next) => {
  try {
    const { trocId, userId, anonym, role, prefix } = req.body
    if (!req.session.user) throw 'Login is required'
    if (!trocId) throw 'trocId string is required on body'
    const troc = await Troc.findById(trocId).exec()
    if (!troc) throw 'Troc not found'

    // Récupère le sub de la personne connecté
    const accessorSub = await Subscribe.findOne({
      trocId,
      userId: req.session.user._id,
    }).exec()

    if (!userId && !anonym && accessorSub?.validedByUser)
      throw 'Subscription already exist and is valided by user'
    if (
      (userId || anonym) &&
      accessorSub.role !== 'admin' &&
      accessorSub.role !== 'cashier'
    )
      throw 'Create subscribe for other user (or anonym) require admin or cashier right'

    if (userId || anonym) {
      // Création d'un sub pour un client
      const newSubscribe: Partial<ISubscribe> = {
        trocId,
        tarifId: troc.tarif.find((t) => t.bydefault)._id,
      }
      newSubscribe.validedByTroc = true
      newSubscribe.role = role
      if (role === 'trader') {
        newSubscribe.prefix =
          prefix || (await findNewPrefix(newSubscribe.trocId))
      }

      if (userId) {
        newSubscribe.userId = userId
      } else {
        // Création d'un sub pour un client anonyme
        const anonymSubCount = await Subscribe.countDocuments({
          trocId,
          $exists: { userId: 0 },
        })
        newSubscribe.name = `Client n°${anonymSubCount + 1}`
        newSubscribe.recoverKey = [
          randomize('0000'),
          randomize('0000'),
          randomize('0000'),
        ].join('-')
      }

      const subscribe = new Subscribe(newSubscribe)
      await subscribe.save()
      res.json(subscribe)
    } else {
      if (accessorSub) {
        // Validation de son propre sub
        accessorSub.validedByUser = true
        await accessorSub.save()
        res.json(accessorSub)
      } else {
        // Création d'un sub sur son propre compte
        const newSubscribe: Partial<ISubscribe> = {
          trocId,
          tarifId: troc.tarif.find((t) => t.bydefault)._id,
        }
        newSubscribe.validedByUser = true
        newSubscribe.userId = req.session.user._id
        const subscribe = new Subscribe(newSubscribe)
        await subscribe.save()
        res.json(subscribe)
      }
    }
  } catch (error) {
    next(error)
  }
}

export const assignRole: RequestHandler = async (req, res, next) => {
  try {
    const { subscribeId, role, prefix } = req.body
    if (typeof subscribeId !== 'string')
      throw 'subscribeId string is required in body'
    if (typeof role !== 'string') throw 'role string is required in body'

    const subscribe = await Subscribe.findById(subscribeId).exec()
    if (!subscribe.userId) throw `Anonym subscribe can't have a role`
    if (subscribe.userId.valueOf() === req.session.user._id)
      throw `You can't change your role`
    const troc = await Troc.findById(subscribe.trocId, { creator: 1 })
    if (subscribe.userId.valueOf() === troc.creator.valueOf())
      throw `The creator of the troc cannot change its role`

    // @ts-ignore
    subscribe.role = role
    if (role === 'trader') {
      subscribe.prefix = prefix || (await findNewPrefix(subscribe.trocId))
    }

    await subscribe.save()
    res.json(subscribe)
  } catch (error) {
    next(error)
  }
}

export const assignTarif: RequestHandler = async (req, res, next) => {
  try {
    const { subscribeId, tarifId } = req.body
    if (typeof subscribeId !== 'string')
      throw 'subscribeId string is required in body'
    if (typeof tarifId !== 'string') throw 'tarifId string is required in body'

    const subscribe = await Subscribe.findById(subscribeId).exec()
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
