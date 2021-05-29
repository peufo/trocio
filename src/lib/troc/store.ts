import { writable } from 'svelte/store'
import type { AxiosError } from 'axios'
import {
  useQuery,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@sveltestack/svelte-query'

import { getNextPageParam } from '$lib/store/util'
import type { Troc } from 'types'

import {
  getTroc,
  searchTrocs,
  getSubscribedTrocs,
  getTrocUserResum,
} from './api'

/**
 * Get troc
 * Info de base d'un troc
 */
export const useTrocOptions = (trocId: string) => ({
  queryFn: getTroc,
  queryKey: ['troc', trocId],
})
export const useTroc = (trocId: string) =>
  useQuery<Troc, AxiosError>(useTrocOptions(trocId))

/**
 * Search trocs
 * Liste de trocs selon un recherche
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
    queryKey: ['searchTroc', query],
    queryFn: searchTrocs,
    getNextPageParam,
  }
}
export const useSearchTrocs = (query: SearchTrocsQuery) =>
  useInfiniteQuery<Troc[], AxiosError>(useSearchTrocsOptions(query))

/**
 * Subscribed trocs
 * Liste des trocs auxquels l'utilisateur est abonné
 */
export const useSubscribedTrocs = () =>
  useInfiniteQuery({
    queryKey: 'subscribedTrocs',
    queryFn: getSubscribedTrocs,
    getNextPageParam,
  })

/**
 * User resum
 * Résumé des interactions de l'utilisateur ou d'un client sur un troc
 */
export function useTrocUserResumOptions(trocId: string, userId?: string) {
  const query = userId ? { trocId, userId } : { trocId }
  return {
    queryKey: ['trocUserResum', query],
    queryFn: getTrocUserResum,
  }
}
export const useTrocUserResum = (trocId: string, userId?: string) =>
  useQuery(useTrocUserResumOptions(trocId, userId))
