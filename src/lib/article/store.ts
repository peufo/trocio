import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
} from '@sveltestack/svelte-query'
import type { AxiosError } from 'axios'

import type { Article } from 'types'
import {
  getArticles,
  createArticle,
  createArticles,
  getNextPageParam,
} from '$lib/article/api'

/** @deprecated */
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
/** @deprecated */
export function useArticles(trocId: string, search: string) {
  return useInfiniteQuery(useArticlesOptions(trocId, search))
}

/** @deprecated */
export function useCreateArticle() {
  return useMutation(createArticle, {
    onSuccess: (article) => {
      //TODO: update provided list query
    },
  })
}

/** @deprecated */
export function useCreateArticles() {
  return useMutation(createArticles, {
    onSuccess: (articles) => {
      //TODO: update provided list query
    },
  })
}
