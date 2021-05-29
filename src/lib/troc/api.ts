import axios from 'axios'
import notify from '$lib/notify'
import { addIsClosed } from '$lib/utils.js'

export function getTroc({ queryKey }: { queryKey: ['troc', string] }) {
  return axios
    .get(`/api/trocs/${queryKey[1]}`)
    .then(({ data }) => {
      if (data.error) throw data.message
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

export function searchTrocs({ pageParam = 0, queryKey }) {
  const params = { ...queryKey[1], skip: pageParam, limit: pageParam ? 2 : 6 }
  return axios
    .get('/api/trocs/search', { params })
    .then(({ data }) => {
      if (data.error) throw data.message
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

export function getSubscribedTrocs({ pageParam = 0 }) {
  const params = { skip: pageParam, limit: 4 }
  return axios
    .get('/api/subscribes/me', { params })
    .then(({ data }) => {
      if (data.error) throw data.message
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

export function getTrocUserResum({ queryKey }) {
  const { trocId, userId } = queryKey[1]
  const params = userId ? { troc: trocId, user: userId } : { troc: trocId }
  return axios
    .get('/api/trocs/details', { params })
    .then(({ data }) => {
      if (data.error) throw data.message
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

async function tamer() {
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
