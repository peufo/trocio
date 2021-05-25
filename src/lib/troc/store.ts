import { writable } from 'svelte/store'
import axios, { AxiosError } from 'axios'
import { useInfiniteQuery } from '@sveltestack/svelte-query'

import { getNextPageParam } from '$lib/store/util'
import type { Troc } from 'types'
import notify from '$lib/notify'

import { searchTrocs, getSubscribedTrocs } from './api'

/**
 * Search trocs
 */
interface SearchTrocsQuery {
  start?: string
  end?: string
  north?: number
  east?: number
  sud?: number
  west?: number
}
export const query = writable<SearchTrocsQuery>({})
export const trocs = writable<Troc[]>([])
export const trocsElement = writable<HTMLElement[]>([])
export const map = writable(null)
export const useSearchTrocsOptions = (query: SearchTrocsQuery) => {
  return {
    queryKey: [query],
    queryFn: searchTrocs,
    getNextPageParam,
  }
}
export const useSearchTrocs = (query: SearchTrocsQuery) =>
  useInfiniteQuery<Troc[], AxiosError>(useSearchTrocsOptions(query))

/**
 * Subscribed trocs
 */
export const subscribedTrocs = writable<Troc[]>([])
export const useSubscribedTrocs = () =>
  useInfiniteQuery('userTrocs', {
    queryFn: getSubscribedTrocs,
    getNextPageParam,
  })
