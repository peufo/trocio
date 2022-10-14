import mongoose from 'mongoose'

import Subscribe from '../models/subscribe'
import { lookupTarif } from './subscribe_get'
import type { Article, ArticleState, Tarif } from '../../types'
const { ObjectId } = mongoose.Types

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

export async function getFee(article: Article) {
  const tarif = await getTarif(article.providerSubId)
  if (tarif && tarif.fee.length && article.price > 0) {
    return tarif.fee
      .sort((a, b) => b.price - a.price)
      .filter((f) => f.price <= article.price)[0].value
  } else {
    return 0
  }
}

export async function getMargin(article: Article) {
  const tarif = await getTarif(article.providerSubId)
  return tarif && article.price ? tarif.margin * article.price : 0
}

interface MatcheStateOption {
  /** Permet au query retourné d'être utilisé dans un aggregat */
  modeAggregate?: boolean
  /** Le article validés qui ont été vendu ou récupérer sont inclue */
  validedIncludNextStates?: boolean
}

export function getMatchesByState(
  state: ArticleState | unknown,
  options: MatcheStateOption = {}
): mongoose.FilterQuery<Article>[] {
  if (typeof state !== 'string') return []
  // https://stackoverflow.com/questions/25497150/mongodb-aggregate-by-field-exists
  const exist = options.modeAggregate
    ? (key: ArticleState) => ({ $gt: [`$${key}`, null] })
    : (key: ArticleState) => ({ [key]: { $exists: true } })
  const existNot = options.modeAggregate
    ? (key: ArticleState) => ({ $lte: [`$${key}`, null] })
    : (key: ArticleState) => ({ [key]: { $exists: false } })

  const states = {
    proposed: [existNot('valided'), existNot('refused')],
    valided: [exist('valided'), existNot('sold'), existNot('recover')],
    refused: [exist('refused')],
    sold: [exist('sold')],
    recover: [exist('recover')],
  }

  if (options.validedIncludNextStates) states.valided = [exist('valided')]

  return states[state] || []
}

export const sumOfArticles = (
  key: ArticleState,
  value: string | number = 1,
  options: MatcheStateOption = {}
) => ({
  $sum: {
    $cond: {
      if: { $and: getMatchesByState(key, { modeAggregate: true, ...options }) },
      then: value,
      else: 0,
    },
  },
})
