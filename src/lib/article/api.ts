import type { Article, ArticleCreate } from 'types'
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

/**
 * Création d'un article
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

export function getProvidedArticles({ pageParam, queryKey }) {
  const { trocId, provider } = queryKey[1]
  const params = {
    troc: trocId,
    provider,
    skip: pageParam,
    limit: pageParam ? 10 : 20,
  }
  if (!params.provider) delete params.provider
  return api<Article[]>('/api/articles/provided', { params })
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
