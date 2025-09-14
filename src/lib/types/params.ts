import type { Article } from "./article.js";
import type { ISubscribe } from "./subscribe.js";

export type DynamicQueryKey =
  | "exact"
  | "search"
  | "or_search"
  | "user_search"
  | "sort"
  | "min"
  | "max";

export type DynamicQuery<Type> = Partial<
  Record<`${DynamicQueryKey}_${string & keyof Type}`, string | number | boolean>
>;

export type ParamsAPI = {
  /** query */
  q?: string;
  limit?: number;
  skip?: number;
};

export interface ParamsSubscribeAPI
  extends DynamicQuery<ISubscribe>,
    ParamsAPI {
  /** Inclue le résumé des interactions d'un participant sur un troc */
  includResum?: boolean;
  /** Inclue les détails du tarif attribué au client */
  includTarif?: boolean;
  /** Ajoute un resultat de recherche sur la base utilisateur global */
  includGlobalUser?: boolean;
}

export interface ParamsArticleAPI extends DynamicQuery<Article>, ParamsAPI {
  /** Sélection de fournisseurs (id) dont on souhaite récupérer les articles */
  provider?: string[];
  /** Sélection de fournisseurs (id) dont on ne souhaite pas récupérer les articles */
  providernot?: string[];
  /** Si vrai, les article sans nom seront retourné */
  include_without_name?: boolean;
}

export interface ParamsClient extends ParamsAPI {
  tarif_selected?: string;
}
