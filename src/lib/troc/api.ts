import { addIsClosed } from '$lib/utils.js'

import type { Troc, TrocUserResume } from 'types'
import { api } from '$lib/api'

export function getTroc({ queryKey }: { queryKey: ['troc', string] }) {
  return api<Troc>(`/api/trocs/${queryKey[1]}`)
}

export function searchTrocs({ pageParam = 0, queryKey }) {
  const params = { ...queryKey[1], skip: pageParam, limit: pageParam ? 2 : 6 }
  return api<Troc[]>('/api/trocs/search', { params })
}

export function getSubscribedTrocs({ pageParam = 0 }) {
  const params = { skip: pageParam, limit: 4 }
  return api<Troc[]>('/api/subscribes/me', { params })
}

export function getTrocUserResum({ queryKey }) {
  const { trocId, userId } = queryKey[1]
  const params = userId ? { troc: trocId, user: userId } : { troc: trocId }
  return api<TrocUserResume>('/api/trocs/resum', { params })
}

async function taGrosseMere() {
  const res = await fetch(`/api/trocs/details?user=${user}&troc=${troc}`)
  let details = await res.json()
  if (details.error) throw details.message
  if (details.provided) details.provided = addStatutField(details.provided, '')
  //select last giveback
  details.givebacks = details.givebacks.map((art) => {
    art.giveback = art.giveback
      .filter((back) => (user === 'undefined' ? !back.user : back.user == user))
      .reverse()[0]
    if (art.giveback) art.giveback.back = new Date(art.giveback.back).getTime()
    return art
  })

  return details
}
