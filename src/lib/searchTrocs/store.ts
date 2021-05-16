import { writable, derived } from 'svelte/store'
import axios, { AxiosError } from 'axios'
import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  UseInfiniteQueryStoreResult,
} from '@sveltestack/svelte-query'

import type { Troc } from 'types'
import notify from '$lib/notify'

interface SearchTrocsQuery {
  start?: string
  end?: string
  north?: number
  east?: number
  sud?: number
  west?: number
}

export const query = writable<SearchTrocsQuery>({})

// Initialized by ./Info.svelte
// Not work
export let queryTrocs: UseInfiniteQueryStoreResult<Troc[], AxiosError> | null =
  null

export const trocs = writable<Troc[]>([])

export const trocsElement = writable<HTMLElement[]>([])

export const map = writable(null)

/*
const queryTrocs = useSearchTrocs($query)
  $: queryTrocs.setOptions(useSearchTrocsOptions($query))
*/

function getTrocs({ queryKey, pageParam = 0 }) {
  let params = { skip: pageParam, ...queryKey[0], limit: pageParam ? 5 : 15 }
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

export const useSearchTrocsOptions = (query: SearchTrocsQuery) => {
  return {
    queryKey: [query],
    queryFn: getTrocs,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length
        ? allPages.flat().length + lastPage.length
        : undefined
    },
  }
}

export const useSearchTrocs = (query: SearchTrocsQuery) => {
  return useInfiniteQuery<Troc[], AxiosError>(useSearchTrocsOptions(query))
}

export default useSearchTrocs
