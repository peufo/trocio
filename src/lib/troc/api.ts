import type {
  Subscribe,
  SubscribeBase,
  SubscribeLookup,
  Troc,
  TrocBase,
  TrocLookup,
  TrocUserResum,
  User,
} from 'types'
import { api, createGetNextPageParam } from '$lib/api'

const FIRST_LIMIT = 4
const NEXT_LIMIT = 4
export const getNextPageParam = createGetNextPageParam(FIRST_LIMIT, NEXT_LIMIT)

export function getTroc({ queryKey }: { queryKey: ['troc', string] }) {
  return api<Troc>(`/api/trocs/${queryKey[1]}`)
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
  const { trocId } = queryKey[1]
  const params = {
    troc: trocId,
    skip: pageParam,
    limit: pageParam ? NEXT_LIMIT : FIRST_LIMIT,
  }
  return api<Subscribe[]>('/api/subscribes', { params })
}

export function getTrocUserResum({ queryKey }) {
  const { trocId, userId } = queryKey[1]
  const params = userId ? { troc: trocId, user: userId } : { troc: trocId }
  return api<TrocUserResum>('/api/trocs/resum', { params })
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
  return api<{ admin: string }, TrocLookup>(`/api/trocs/${trocId}/admin`, {
    method: 'post',
    data: { admin: userId },
    success: 'Administrateur ajouté',
  })
}

export function removeAdmin({ trocId, userId }: TrocUserQuery) {
  return api<{ admin: string }, TrocLookup>(
    `/api/trocs/${trocId}/admin/remove`,
    {
      method: 'post',
      data: { admin: userId },
      success: 'Administrateur supprimé',
    }
  )
}

export function addCashier({ trocId, userId }: TrocUserQuery) {
  return api<{ cashier: string }, TrocLookup>(`/api/trocs/${trocId}/cashier`, {
    method: 'post',
    data: { cashier: userId },
    success: 'Caisser ajouté',
  })
}

export function removeCashier({ trocId, userId }: TrocUserQuery) {
  return api<{ cashier: string }, TrocLookup>(
    `/api/trocs/${trocId}/cashier/remove`,
    {
      method: 'post',
      data: { cashier: userId },
      success: 'Caisser supprimé',
    }
  )
}

export function addTrader({ trocId, userId }: TrocUserQuery) {
  return api<{ trader: string }, TrocLookup>(`/api/trocs/${trocId}/trader`, {
    method: 'post',
    data: { trader: userId },
    success: 'Commerçant ajouté',
  })
}

export function removeTrader({ trocId, userId }: TrocUserQuery) {
  return api<{ trader: string }, TrocLookup>(
    `/api/trocs/${trocId}/trader/remove`,
    {
      method: 'post',
      data: { trader: userId },
      success: 'Commerçant supprimé',
    }
  )
}

export function setTraderPrefix({
  trocId,
  userId,
  prefix,
}: TrocUserQuery & { prefix: string }) {
  return api<{ trader: string; prefix: string }, TrocLookup>(
    `/api/trocs/${trocId}/trader/prefix`,
    {
      method: 'post',
      data: { trader: userId, prefix },
      success: 'Préfix mis à jour',
    }
  )
}
