import { writable } from 'svelte/store'
import type L from 'leaflet'
import { useMutation } from '@sveltestack/svelte-query'

import type { SubscribeLookup, Troc, TrocLookup, SearchTrocsQuery } from 'types'
import {
  getTroc,
  searchTrocs,
  getsubscribes,
  addAdmin,
  removeAdmin,
  addCashier,
  removeCashier,
  addTrader,
  removeTrader,
  setTraderPrefix,
  createTroc,
  updateTroc,
  getNextPageParam,
  createSubscribe,
  createTarif,
  deleteTarif,
  editTarif,
  addApply,
  removeApply,
} from '$lib/troc/api'

/**
 * Get troc
 * Info détaillé d'un troc + liste des participants
 */
export const troc = writable<TrocLookup>(undefined)

/**
 * Search Subscribers
 */
interface SearchSubscribersQuery {
  trocId: string
  q: string
  filtredTarifs?: string[]
}
export const subscribes = writable<SubscribeLookup[]>([])

/**
 * Search trocs
 * Liste de trocs selon un recherche
 */

export const queryTrocsParams = writable<SearchTrocsQuery>({})
export const trocs = writable<TrocLookup[]>([])
export const trocsElement = writable<{ [key: string]: HTMLElement }>({})
export const map = writable<L.Map>()

/**
 * Creation
 * @deprecated
 */
export const useCreateTroc = () => useMutation(createTroc, { onSuccess })
/** @deprecated */
export const useCreateSubscribe = () => useMutation(createSubscribe)

/**
 * Mise à jour
 */

/** @deprecated */
export const useUpdateTroc = () => useMutation(updateTroc, { onSuccess })

/**
 * Collaborators
 */
/** @deprecated */
export const useAddAdmin = () => useMutation(addAdmin, { onSuccess })
/** @deprecated */
export const useRemoveAdmin = () => useMutation(removeAdmin, { onSuccess })
/** @deprecated */
export const useAddCashier = () => useMutation(addCashier, { onSuccess })
/** @deprecated */
export const useRemoveCashier = () => useMutation(removeCashier, { onSuccess })
/** @deprecated */
export const useAddTrader = () => useMutation(addTrader, { onSuccess })
/** @deprecated */
export const useRemoveTrader = () => useMutation(removeTrader, { onSuccess })
/** @deprecated */
export const useSetTraderPrefix = () =>
  useMutation(setTraderPrefix, { onSuccess })

/**
 * Tarif
 */
/** @deprecated */
export const useCreateTarif = () => useMutation(createTarif, { onSuccess })
/** @deprecated */
export const useEditTarif = () => useMutation(editTarif, { onSuccess })
/** @deprecated */
export const useDeleteTarif = () => useMutation(deleteTarif, { onSuccess })
/** @deprecated */
export const useAddApply = () => useMutation(addApply, { onSuccess })
/** @deprecated */
export const useRemoveApply = () => useMutation(removeApply, { onSuccess })

/**
 * Update troc on success
 */
/** @deprecated */
function onSuccess(newTroc: TrocLookup) {
  troc.set(newTroc)
}
