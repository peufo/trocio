import type { ISubscribe } from './subscribe'
import type { User } from './user'

export type ArticleCreate = {
  _id?: string
  /** ID du subscribe de l'utilisateur qui propose l'article */
  providerSubId: string
  /** Shortcuts */
  trocId?: string
  providerId?: string
  /** Reference lisible et unique de l'article TODO: rendre unique */
  ref?: string
  /** Nom ou désignation de l'article*/
  name: string
  /** Prix de l'article */
  price: number
  /** Index pour préserver l'ordre à la création */
  index?: number
  tagId?: string
}

export type Article = ArticleCreate & {
  /** ID de l'article */
  _id: string
  createdAt: Date
  updatedAt: Date

  tagId: string

  /**
   * Frais prise par l'organisation sur l'article lors de sa validation.
   * Elle est calculé sur le prix en fonction du tarif décidé pour le fournisseur.
   */
  fee: number
  /**
   * Marge prise par l'organisation sur l'article lors de sa vente.
   * Elle est calculé sur le prix en fonction du tarif décidé pour le fournisseur.
   */
  margin: number
  /** Date de validation de l'article par l'organisateur (validator) */
  valided?: Date
  /** Date du refus de l'article par l'organisateur (validator) */
  refused?: Date
  /** Date de la vente de l'article (seller) -> (buyer) */
  sold?: Date
  /** Date de la récupération de l'article par le fournisseur (seller) -> (provider) */
  recover?: Date

  /** ID du sub ayant effectué l'achat */
  buyerSubId?: string
  /** ID du sub de l'organisation ayant validé ou refusé l'article */
  validatorSubId?: string
  /** ID du sub de l'organisation ayant vendu ou rendu l'article */
  sellerSubId?: string

  /** Historique des corrections de l'articles */
  corrections: ArticleCorrection[]

  /** Raccourci vers les utilisateurs pour ne pas passé par les subscribes */
  buyerId?: string
  validatorId?: string
  sellerId?: string
}

export type ArticleLookup = Article & {
  provider?: User
  providerSub?: ISubscribe
  buyer?: User
  buyerSub?: ISubscribe
  validator?: User
  seller?: User
}

export type ArticleWithState = ArticleLookup & {
  state: ArticleState
}

export type ArticleCorrection = {
  timestamp: Date
  authorId: string
  authorSubId: string
  event:
    | 'edit-name'
    | 'edit-price'
    | 'cancel-valided'
    | 'cancel-refused'
    | 'cancel-sold'
    | 'cancel-recover'
  message?: string
  oldValue?: any
  newValue?: any
}

export type ArticleCorrectionLookup = ArticleCorrection & {
  author: { _id: string; name: string }
}

export type ArticleCorrectionsLookup = {
  _id: string
  corrections: ArticleCorrectionLookup[]
}

export type ArticleState =
  | 'proposed'
  | 'valided'
  | 'refused'
  | 'sold'
  | 'recover'
