import type { RoleEnum } from 'types'
import type { Article } from './article'
import type { ISubscribe } from './subscribe'

export declare type DynamicQuery =
  | 'exact'
  | 'search'
  | 'or_search'
  | 'user_search'
  | 'sort'
  | 'min'
  | 'max'

export type DynamicQueryArticle = Partial<
  Record<`${DynamicQuery}_${keyof Article}`, string | number>
>

export type DynamicQuerySubscribe = Partial<
  Record<`${DynamicQuery}_${keyof ISubscribe}`, string | number>
>

export interface ParamsAPI {
  trocId?: string
  /** tarif à ne pas afficher */
  filtredTarifs?: string[]
  /** query */
  q?: string
  limit?: number
  skip?: number
}

export interface ParamsSubscribeAPI extends DynamicQuerySubscribe, ParamsAPI {
  /** Inclue le résumé des interactions d'un participant sur un troc */
  includResum?: boolean
  /** Inclue les détails du tarif attribué au client */
  includTarif?: boolean
}

export interface ParamsArticleAPI extends DynamicQueryArticle, ParamsAPI {
  /** Sélection de fournisseurs (id) dont on souhaite récupérer les articles */
  provider?: string[]
  /** Sélection de fournisseurs (id) dont on ne souhaite pas récupérer les articles */
  providernot?: string[]
  /** Si vrai, les article sans nom seront retourné */
  include_without_name?: boolean
}

export declare interface ParamsClient extends ParamsAPI {
  tab_admin?: string
  tarif_selected?: string
}
