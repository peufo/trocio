import { User } from './user'

export declare interface ArticleCreate {
  /** ID du subscriber qui propose l'article */
  providerSubId: string
  /** Reference lisible et unique de l'article TODO: rendre unique */
  ref?: string
  /** Nom ou désignation de l'article*/
  name: string
  /** Prix de l'article */
  price: number
}

export declare interface Article extends ArticleCreate {
  /** ID de l'article */
  _id: string
  /** ID du troc sur lequel l'article proposé */
  trocId: string
  createdAt: Date
  updatedAt: Date
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
  /** giveback Listes des retours de l'article (si ils sont autorisés) */
  giveback: {
    /** Date de la vente qui à été annulé */
    sold: Date
    /** Date de retour de l'article */
    back: Date
    /** Raison du retour */
    raison: string
    /** Client ayant effetué le retour */
    subscribeId: string
  }[]
  /** ID du sub ayant effectué l'achat */
  buyerSubId?: string
  /** ID du sub de l'organisation ayant validé ou refusé l'article */
  validatorSubId?: string
  /** ID du sub de l'organisation ayant vendu ou rendu l'article */
  sellerSubId?: string
}

export declare interface ArticleLookup extends Article {
  provider?: User
  buyer?: User
  validator?: User
  seller?: User
}
