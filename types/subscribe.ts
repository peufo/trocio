import type { User, Troc, Tarif, Article, IPaymentLookup } from 'types'

export type RoleEnum = 'basic' | 'trader' | 'cashier' | 'admin'

export interface SubscribeBase {
  trocId: string
  /** Logged user user can provide userId */
  userId?: string
}

/** Réponse lors de recherche de subscribe non participant au troc */
export interface SubscribeBaseWithUser extends SubscribeBase {
  user: User
}

export interface ISubscribe extends SubscribeBase {
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

export interface SubscribeLookup extends ISubscribe {
  troc: Troc
  user?: User
}

/** Résumé des interactions d'un utilisateur avec un troc */
export interface SubscribeResum extends ISubscribe {
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
