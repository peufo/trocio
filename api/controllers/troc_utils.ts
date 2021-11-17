import mongoose from 'mongoose'

import Troc from '../models/troc'
import Subscribe from '../models/subscribe'
import { lookupTarif } from './subscribe_get'
import type { Tarif } from '../../types'

const { ObjectId } = mongoose.Types

type Callback = (err?: Error | null, returnValue?: any) => any

export async function getTarif(
  subscribeId: string | typeof ObjectId
): Promise<Tarif> {
  const aggregate = Subscribe.aggregate()
  const match =
    typeof subscribeId === 'string'
      ? { _id: new ObjectId(subscribeId) }
      : { _id: subscribeId }

  aggregate.match(match)
  lookupTarif(aggregate)
  const subscribes = await aggregate.exec()
  return subscribes[0].tarif
}

export function getFee(art, tarif) {
  if (tarif && tarif.fee.length && art.price > 0) {
    return (art.fee = tarif.fee
      .sort((a, b) => b.price - a.price)
      .filter((f) => f.price <= art.price)[0].value)
  } else if (art.price == 0) {
    return (art.fee = 0)
  } else return art.fee || 0
}

export function getMargin(art, tarif) {
  if (tarif && art.price) {
    return (art.margin = tarif.margin * art.price)
  } else {
    return (art.margin = 0)
  }
}

//return an error if not OK
export function scheduleValidation({ schedule }) {
  if (
    schedule &&
    schedule[0] &&
    new Date(schedule[0].open).getTime() <
      new Date().getTime() + 1000 * 60 * 60 * 4
  )
    return Error(`The troc cannot start in less than 4 hours`)
  return null
}

export default {
  getFee,
  getMargin,
  scheduleValidation,
}
