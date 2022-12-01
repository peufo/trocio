import type { User, Troc, Tarif, Article, IPaymentLookup } from 'types'

export type RoleEnum = 'basic' | 'trader' | 'cashier' | 'admin'

export type SubscribeBase = {
  trocId: string
  /** Logged user user can provide userId */
  userId?: string
}

/** Réponse lors de recherche de subscribe non participant au troc */
export type SubscribeBaseWithUser = SubscribeBase & {
  user: User
}

export type ISubscribe = SubscribeBase & {
  _id: string
  createdAt: Date
  updatedAt: Date

  /** Util pour les subscribes anonyme*/
  name: string
  recoverKey: string

  /** Rôle de l'utilsateur sur le troc */
  role: RoleEnum

  /** L'inscription à été faite ou validé par le participant */
  validedByUser: boolean

  /** L'inscription à été faite ou validé par un organisateur du troc */
  validedByTroc: boolean

  /** Réference vers le tarif qui est attribué au participant */
  tarifId: string

  /** Prefix pour les traders  */
  prefix?: string
}

export type SubscribeLookup = ISubscribe & {
  troc: Troc
  user?: User
}

/** Résumé des interactions d'un utilisateur avec un troc */
export type SubscribeResum = SubscribeLookup & {
  resum: {
    balance: number
    articleCount?: number
    proposedCount?: number
    proposedSum?: number
    validedCount?: number
    validedSum?: number
    refusedCount?: number
    soldCount?: number
    soldSum?: number
    feeSum?: number
    marginSum?: number
    purchasesCount?: number
    purchasesSum?: number
    purchases?: Article[]
    paymentsCount?: number
    paymentsSum?: number
    payments?: IPaymentLookup[]
  }
  tarif: Tarif
}
