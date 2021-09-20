import type { Article } from './article'

export declare type DynamicQuery =
  | 'search'
  | 'or_search'
  | 'sort'
  | 'exact'
  | 'min'
  | 'max'
export declare type DynamicQueryArticle = Partial<
  Record<`${DynamicQuery}_${keyof Article}`, string | number>
>

export declare interface ParamsAPI {
  trocId?: string
  /** tarif à ne pas afficher */
  filtredTarifs?: string[]
  /** query */
  q?: string
  limit?: number
  skip?: number
}

export declare interface ParamsArticleAPI
  extends DynamicQueryArticle,
    ParamsAPI {
  /**
   * Seléctionnes les tarifs d'un troc
   * TODO: à remplacer par trocId
   */
  troc?: string
  /** Ne renvoie que les tarifs d'un certain dans un certain statut */
  select_statut?: 'proposed' | 'valided' | 'refused' | 'sold' | 'recover'
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
