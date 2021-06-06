import { Article } from 'types'
import { User } from 'types'

/** Information minimal pour la création d'un troc */
export declare interface TrocBase {
  name: string
  description: string
  is_try: boolean
  address?: string
  location?: {
    lat: number
    lng: number
  }
  schedule?: {
    open: string
    close: string
  }[]
  society?: string
  societyweb?: string
}

/** Information complette d'un troc */
export declare interface Troc extends TrocBase {
  _id: string
  tag: {
    width: number
    height: number
    padding: number
    border: boolean
  }
  admin: string[]
  cashier: string[]
  articlelastref: number
  articles?: object[]
  subscriber: number
  creator: string
  trader: {
    prefix: string
    user: string
  }[]
  tarif: []
  createdAt: string
  updatedAt: string
  __v: 0
  isClosed: boolean
  id: string
  isAdmin: boolean
  isCashier: boolean
  isSubscribed: boolean
}

/** Information complette avec les informations collaborateurs */
export declare interface TrocLookup extends Troc {
  admin: User[]
  cashier: User[]
  trader: {
    prefix: string
    user: User
  }[]
  creator: User
}

/** Résumé des interactions d'un utilisateur avec un troc */
export declare interface TrocUserResume {
  troc: string
  user: string
  balance: number
  providedCount: number
  providedSum: number
  feeSum: number
  soldSum: number
  marginSum: number
  purchasesCount: number
  purchasesSum: number
  paymentsCount: number
  paymentsSum: number
}
