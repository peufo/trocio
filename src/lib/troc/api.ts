import axios from 'axios'
import notify from '$lib/notify'
import { addIsClosed } from '$lib/utils.js'

interface GetTrocQuery {
  queryKey: ['troc', string]
}
export function getTroc({ queryKey }: GetTrocQuery) {
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
  const params = { ...queryKey[0], skip: pageParam, limit: pageParam ? 2 : 6 }
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
