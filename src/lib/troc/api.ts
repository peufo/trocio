import { addIsClosed } from '$lib/utils.js'

import type { Troc, TrocLookup, TrocUserResume } from 'types'
import { api } from '$lib/api'

export function getTroc({ queryKey }: { queryKey: ['troc', string] }) {
  return api<Troc>(`/api/trocs/${queryKey[1]}`)
}

export function searchTrocs({ pageParam = 0, queryKey }) {
  const params = { ...queryKey[1], skip: pageParam, limit: pageParam ? 2 : 6 }
  return api<Troc[]>('/api/trocs/search', { params })
}

export function getSubscribedTrocs({ pageParam = 0 }) {
  const params = { skip: pageParam, limit: 4 }
  return api<Troc[]>('/api/subscribes/me', { params })
}

export function getTrocUserResum({ queryKey }) {
  const { trocId, userId } = queryKey[1]
  const params = userId ? { troc: trocId, user: userId } : { troc: trocId }
  return api<TrocUserResume>('/api/trocs/resum', { params })
}

export function addAdmin({
  trocId,
  userId,
}: {
  trocId: string
  userId: string
}) {
  return api<TrocLookup>(`/api/trocs/${trocId}/admin`, {
    method: 'post',
    data: { admin: userId },
    success: 'Administrateur ajouté',
  })
}

export function removeAdmin({
  trocId,
  userId,
}: {
  trocId: string
  userId: string
}) {
  return api<TrocLookup>(`/api/trocs/${trocId}/admin/remove`, {
    method: 'post',
    data: { admin: userId },
    success: 'Administrateur supprimé',
  })
}
