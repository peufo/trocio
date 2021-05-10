import axios from 'axios'
import notify from '$lib/notify'
import { addIsClosed } from '$lib/utils.js'

export function getUserTrocs({ pageParam = 0 }) {
  return axios
    .get(`/api/subscribes/me?skip=${pageParam}&limit=2`)
    .then(({ data }) => {
      if (data.error) throw data.message
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })
}
