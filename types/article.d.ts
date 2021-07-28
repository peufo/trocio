export declare interface ArticleCreate {
  /** ID du troc auquel l'article proposé */
  troc: string
  /** ID de l'utilisateur qui propose l'article */
  provider: string
  /** Reference lisible et unique de l'article TODO: rendre unique */
  ref: string
  /** Nom ou désignation de l'article*/
  name: string
  /** Prix de l'article */
  price: number
}

export declare interface Article extends ArticleCreate {
  /** ID de l'article */
  _id: string
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
  valided: Date
  /** Date du refus de l'article par l'organisateur (validator) */
  refused: Date
  /** Date de la vente de l'article (seller) -> (buyer) */
  sold: Date
  /** Date de la récupération de l'article par le fournisseur (seller) -> (provider) */
  recover: Date
  /** giveback Listes des retours de l'article (si ils sont autorisés) */
  giveback: {
    /** Date de la vente qui à été annulé */
    sold: Date
    /** Date de retour de l'article */
    back: Date
    /** Raison du retour */
    raison: string
    /** Client ayant effetué le retour */
    user: string
  }[]
  /** ID du client ayant effectué l'achat */
  buyer: string
  /** ID du membre de l'organisation ayant validé ou refusé l'article */
  validator: string
  /** ID du membre de l'organisation ayant vendu ou rendu l'article */
  seller: string
}
