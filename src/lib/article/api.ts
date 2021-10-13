import type { Article, ArticleCreate } from 'types'
import { api, createGetNextPageParam } from '$lib/api'

const FIRST_LIMIT = 10
const NEXT_LIMIT = 20
/** @deprecated */
export const getNextPageParam = createGetNextPageParam(FIRST_LIMIT, NEXT_LIMIT)

interface GetArticlesQuery {
  pageParam: number
  queryKey: ['article', { trocId: string; search: string }]
}
/** @deprecated */
export function getArticles({ pageParam = 0, queryKey }: GetArticlesQuery) {
  const { trocId, search } = queryKey[1]
  console.log({ pageParam })
  const params = {
    trocId,
    search_name: search,
    skip: pageParam,
    limit: pageParam ? NEXT_LIMIT : FIRST_LIMIT,
  }
  return api<Article[]>('/api/articles', { params })
}

/**
 * Création d'un article
 * @deprecated
 */
export function createArticle(article: ArticleCreate) {
  return api<ArticleCreate, Article>('/api/articles', {
    method: 'post',
    data: article,
    success: 'Article ajouté',
  })
}

/**
 * Création d'articles
 *  @deprecated
 */
export function createArticles(article: ArticleCreate[]) {
  return api<ArticleCreate[], Article[]>('/api/articles', {
    method: 'post',
    data: article,
    success: `${article.length} article${article.length > 1 ? 's' : ''} ajouté${
      article.length > 1 ? 's' : ''
    }`,
  })
}

/*
if ($details.tarif && $details.provided.length + 1 > $details.tarif.maxarticles) {
			notify.warning({
				title: `Trop d'articles`,
				text: `Vous avez atteint le nombre maximal d'articles pouvant être proposés.\nRenseignez-vous auprès de l'organisateur pour lever cette limite.`
			})
			return
		}
		
		try {
			let body = {troc: $details.troc, provider: $details.user, name: newName, price: newPrice}
			console.log(body)
			let res = await fetch('/api/articles', getHeader(body))
			let json = await res.json()
			if (json.success) {
				
				$details.provided = [...$details.provided, addStatutField(json.message[0])]
				
				newName = ''
				newPrice = ''

				//preserve dialog
				//document.getElementById(`newArticleName`).focus()
				dialogActive = false
				dispatch('articleCreated')
				notify.success('Article ajouté')
				return
				
			}else notify.error(json.message)
		} catch (error) {
			notify.error(error.message)
		}
*/
