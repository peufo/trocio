import axios from 'axios'
import notify from '$lib/notify'
import type { Article } from 'types'

interface GetArticlesQuery {
  pageParam: number
  queryKey: ['article', { trocId: string; search: string }]
}
export function getArticles({
  pageParam = 0,
  queryKey,
}: GetArticlesQuery): Promise<Article[]> {
  const { trocId, search } = queryKey[1]
  return axios
    .get('/api/articles', {
      params: {
        troc: trocId,
        search_name: search,
        skip: pageParam,
        limit: pageParam ? 10 : 20,
      },
    })
    .then(({ data }) => {
      if (data.error) throw data.message
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })
}
