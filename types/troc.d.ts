import { Article } from 'types'
import { User } from 'types'

export declare interface Troc {
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
  is_try: boolean
  subscriber: number
  society: string
  societyweb: string
  creator: string
  name: string
  address: string
  location: {
    lat: number
    lng: number
  }
  description: string
  trader: {
    prefix: string
    user: string
  }[]
  schedule: {
    open: string
    close: string
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

export declare interface TrocLookup extends Troc {
  admin: User[]
  cashier: User[]
  trader: {
    prefix: string
    user: User
  }[]
  creator: User
}

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
