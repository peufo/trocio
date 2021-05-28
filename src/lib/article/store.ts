import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
} from '@sveltestack/svelte-query'
import type { AxiosError } from 'axios'

import type { Article } from 'types'
import { getArticles } from '$lib/article/api'
import { getNextPageParam } from '$lib/store/util'

export function useArticlesOptions(
  trocId: string,
  search: string
): UseInfiniteQueryOptions<Article[], AxiosError> {
  return {
    queryFn: getArticles,
    queryKey: ['article', { trocId, search }],
    getNextPageParam,
  }
}

export function useArticles(trocId: string, search: string) {
  return useInfiniteQuery(useArticlesOptions(trocId, search))
}
