import { api } from '$lib/api'
import { getState, STATE_LABEL } from '$lib/utils'
import type { Article, ArticleState } from 'types'

export async function getMismatchRaison(
  articleId: string,
  queryParams: { [key: string]: string }
): Promise<string> {
  const [article] = await api<Article[]>('/api/articles', {
    params: { exact__id: articleId },
  })
  if (!article) return 'Ne correspond pas à un article Trocio'

  // Verifie le troc
  const exeptedTrocId = queryParams.exact_trocId
  if (article.trocId !== exeptedTrocId) return 'Ne correspond pas à ce troc'

  // Verifie l'état de l'article
  const state = getState(article)
  const exeptedState = queryParams.exact_state as ArticleState
  if (state !== exeptedState) {
    const stateLabel = STATE_LABEL[state]
    const expectedStateLabel = STATE_LABEL[exeptedState]
    return `Article "${stateLabel}" au lieu de "${expectedStateLabel}"`
  }

  // Verifie les condition client
  const exeptedProviderSubId = queryParams.exact_providerSubId
  const notExeptedProviderSubId = queryParams.ne_exact_providerSubId
  const providerSubId = article.providerSubId
  if (exeptedProviderSubId && exeptedProviderSubId !== providerSubId) {
    if (state === 'proposed') return `N'a pas été proposé par le client`
    if (state === 'valided') return `N'a pas été déposé par le client`
  }

  if (notExeptedProviderSubId && notExeptedProviderSubId === providerSubId) {
    return `A été déposé par le client`
  }

  return 'Erreur inconnu'
}
