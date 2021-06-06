import { writable } from 'svelte/store'
import type { AxiosError } from 'axios'
import {
  useQuery,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  useQueryClient,
} from '@sveltestack/svelte-query'

import { getNextPageParam } from '$lib/store/util'
import type { Troc, TrocBase, TrocLookup } from 'types'

import {
  getTroc,
  searchTrocs,
  getSubscribedTrocs,
  getTrocUserResum,
  addAdmin,
  removeAdmin,
  addCashier,
  removeCashier,
  addTrader,
  removeTrader,
  setTraderPrefix,
  createTroc,
} from '$lib/troc/api'

/**
 * Get troc
 * Info détaillé d'un troc
 */
export const troc = writable<TrocLookup>(null)
export const useTrocOptions = (trocId: string) => ({
  queryFn: getTroc,
  queryKey: ['troc', trocId],
  onSuccess: (t) => troc.set(t),
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

/**
 * Creation
 */
export const useCreateTroc = () => useMutation(createTroc, { onSuccess })

/**
 * Collaborators
 */
export const useAddAdmin = () => useMutation(addAdmin, { onSuccess })
export const useRemoveAdmin = () => useMutation(removeAdmin, { onSuccess })
export const useAddCashier = () => useMutation(addCashier, { onSuccess })
export const useRemoveCashier = () => useMutation(removeCashier, { onSuccess })
export const useAddTrader = () => useMutation(addTrader, { onSuccess })
export const useRemoveTrader = () => useMutation(removeTrader, { onSuccess })
export const useSetTraderPrefix = () =>
  useMutation(setTraderPrefix, { onSuccess })

function onSuccess(newTroc: TrocLookup) {
  troc.set(newTroc)
}
