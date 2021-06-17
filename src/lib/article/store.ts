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
  getProvidedArticles,
  getNextPageParam,
} from '$lib/article/api'

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

export function useCreateArticle() {
  return useMutation(createArticle, {
    onSuccess: (article) => {
      //TODO: update provided list query
    },
  })
}

export function useCreateArticles() {
  return useMutation(createArticles, {
    onSuccess: (articles) => {
      //TODO: update provided list query
    },
  })
}

export function useProvidedArticlesOptions(
  trocId: string,
  provider?: string
): UseInfiniteQueryOptions<Article[], AxiosError> {
  const query = provider ? { trocId, provider } : { trocId }
  return {
    queryFn: getProvidedArticles,
    queryKey: ['articlesProvided', query],
    getNextPageParam,
  }
}
export function useProvidedArticles(trocId: string, provider?: string) {
  return useInfiniteQuery(useProvidedArticlesOptions(trocId, provider))
}
