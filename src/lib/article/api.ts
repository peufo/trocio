import type { Article } from 'types'
import { api } from '$lib/api'

interface GetArticlesQuery {
  pageParam: number
  queryKey: ['article', { trocId: string; search: string }]
}
export function getArticles({ pageParam = 0, queryKey }: GetArticlesQuery) {
  const { trocId, search } = queryKey[1]
  const params = {
    troc: trocId,
    search_name: search,
    skip: pageParam,
    limit: pageParam ? 10 : 20,
  }
  return api<Article[]>('/api/articles', { params })
}
