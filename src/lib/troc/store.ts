import { writable } from 'svelte/store'
import type { AxiosError } from 'axios'
import {
  useQuery,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@sveltestack/svelte-query'

import { getNextPageParam } from '$lib/store/util'
import type { Troc } from 'types'

import { getTroc, searchTrocs, getSubscribedTrocs } from './api'

/**
 * Get troc
 */
export const useTrocOptions = (trocId: string) => ({
  queryFn: getTroc,
  queryKey: ['troc', trocId],
})
export const useTroc = (trocId: string) =>
  useQuery<Troc, AxiosError>(useTrocOptions(trocId))

/**
 * Search trocs
 */
interface SearchTrocsQuery {
  _id?: string
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
export function useSearchTrocsOptions(
  query: SearchTrocsQuery
): UseInfiniteQueryOptions<Troc[], AxiosError> {
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
  useInfiniteQuery({
    queryKey: 'subscribedTrocs',
    queryFn: getSubscribedTrocs,
    getNextPageParam,
  })
