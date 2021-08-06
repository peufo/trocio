import type { QueryKey } from '@sveltestack/svelte-query'
import type {
  ArrayElement,
  Subscribe,
  SubscribeBase,
  SubscribeLookup,
  Troc,
  TrocBase,
  TrocLookup,
  TrocUserResum,
  User,
  Tarif,
  TrocStats,
} from 'types'
import { api, createGetNextPageParam } from '$lib/api'

const FIRST_LIMIT = 10
const NEXT_LIMIT = 5
export const getNextPageParam = createGetNextPageParam(FIRST_LIMIT, NEXT_LIMIT)

export function getTroc({ queryKey }: { queryKey: ['troc', string] }) {
  return api<Troc>(`/api/trocs/${queryKey[1]}`)
}

export function getTrocUserResum({ queryKey }) {
  return api<TrocUserResum>('/api/trocs/resum', { params: queryKey[1] })
}

export function getTrocStats({ queryKey }) {
  const { trocId = '' } = queryKey[1]
  return api<TrocStats>(`/api/trocs/${trocId}/stats`, { params: queryKey[1] })
}

export function searchTrocs({ pageParam = 0, queryKey }) {
  const params = {
    ...queryKey[1],
    skip: pageParam,
    limit: pageParam ? NEXT_LIMIT : FIRST_LIMIT,
  }
  return api<Troc[]>('/api/trocs', { params })
}

export function getSubscribedTrocs({ pageParam = 0 }) {
  const params = {
    skip: pageParam,
    limit: pageParam ? NEXT_LIMIT : FIRST_LIMIT,
  }
  return api<Troc[]>('/api/subscribes/me', { params })
}

export function getsubscribes({ pageParam = 0, queryKey }) {
  const params = {
    ...queryKey[1],
    skip: pageParam,
    limit: pageParam ? NEXT_LIMIT : FIRST_LIMIT,
  }
  return api<SubscribeLookup[]>('/api/subscribes', { params })
}

export function createSubscribe(
  subscribeBase: SubscribeBase
): Promise<SubscribeLookup> {
  return api<SubscribeBase, SubscribeLookup>('/api/subscribes', {
    method: 'post',
    data: subscribeBase,
    success: 'Nouvelle participation',
  })
}

export function createTroc(trocBase: TrocBase) {
  return api<TrocBase, TrocLookup>('/api/trocs', {
    method: 'post',
    data: trocBase,
    success: 'Nouveau troc créer',
  })
}

export function updateTroc(troc: Partial<Troc>) {
  return api<Troc, TrocLookup>(`/api/trocs/${troc._id}`, {
    method: 'patch',
    data: troc,
    success: 'Troc mis à jour',
  })
}

interface TrocUserQuery {
  trocId: string
  userId: string
}

export function addAdmin({ trocId, userId }: TrocUserQuery) {
  return api<{ admin: string }, TrocLookup>(
    `/api/trocs/${trocId}/admin/${userId}`,
    {
      method: 'post',
      success: 'Administrateur ajouté',
    }
  )
}

export function removeAdmin({ trocId, userId }: TrocUserQuery) {
  return api<{ admin: string }, TrocLookup>(
    `/api/trocs/${trocId}/admin/${userId}`,
    {
      method: 'delete',
      success: 'Administrateur supprimé',
    }
  )
}

export function addCashier({ trocId, userId }: TrocUserQuery) {
  return api<{ cashier: string }, TrocLookup>(
    `/api/trocs/${trocId}/cashier/${userId}`,
    {
      method: 'post',
      success: 'Caisser ajouté',
    }
  )
}

export function removeCashier({ trocId, userId }: TrocUserQuery) {
  return api<{ cashier: string }, TrocLookup>(
    `/api/trocs/${trocId}/cashier/${userId}`,
    {
      method: 'delete',
      success: 'Caisser supprimé',
    }
  )
}

export function addTrader({ trocId, userId }: TrocUserQuery) {
  return api<{ trader: string }, TrocLookup>(
    `/api/trocs/${trocId}/trader/${userId}`,
    {
      method: 'post',
      success: 'Commerçant ajouté',
    }
  )
}

export function removeTrader({ trocId, userId }: TrocUserQuery) {
  return api<{ trader: string }, TrocLookup>(
    `/api/trocs/${trocId}/trader/${userId}`,
    {
      method: 'delete',
      success: 'Commerçant supprimé',
    }
  )
}

export function setTraderPrefix({
  trocId,
  userId,
  prefix,
}: TrocUserQuery & { prefix: string }) {
  return api<{ prefix: string }, TrocLookup>(
    `/api/trocs/${trocId}/trader/${userId}/prefix`,
    {
      method: 'post',
      data: { prefix },
      success: 'Préfix mis à jour',
    }
  )
}

interface TrocQuery {
  trocId: string
}
interface TarifQuery {
  tarifId: string
}
interface UserQuery {
  userId: string
}
interface TrocTarifQuery extends TrocQuery, TarifQuery {}
interface TrocTarifUserQuery extends TrocTarifQuery, UserQuery {}

export function createTarif({
  trocId,
  name,
  margin,
  maxarticles,
  fee,
}: TrocQuery & Partial<Tarif>) {
  return api<{}, TrocLookup>(`/api/trocs/${trocId}/tarif`, {
    method: 'post',
    data: { name, margin, maxarticles, fee },
    success: 'Nouveau tarif créé',
  })
}

export function deleteTarif({ trocId, tarifId }: TrocTarifQuery) {
  return api<{}, TrocLookup>(`/api/trocs/${trocId}/tarif/${tarifId}`, {
    method: 'delete',
    success: 'Tarif supprimé',
  })
}

export function editTarif({
  trocId,
  tarifId,
  name,
  margin,
  maxarticles,
  fee,
}: TrocTarifQuery & Partial<Tarif>) {
  return api<Partial<Tarif>, TrocLookup>(
    `/api/trocs/${trocId}/tarif/${tarifId}`,
    {
      method: 'patch',
      data: { name, margin, maxarticles, fee },
      success: 'Tarif mis à jour',
    }
  )
}

export function addApply({ trocId, tarifId, userId }: TrocTarifUserQuery) {
  return api<{}, TrocLookup>(
    `/api/trocs/${trocId}/tarif/${tarifId}/apply/${userId}`,
    {
      method: 'post',
    }
  )
}

// Not util ?
export function removeApply({ trocId, tarifId, userId }: TrocTarifUserQuery) {
  return api<{}, TrocLookup>(
    `/api/trocs/${trocId}/tarif/${tarifId}/apply/${userId}`,
    {
      method: 'delete',
    }
  )
}
