import { Article } from 'types'

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
    _id: string
    prefix: string
    user: string
    id: string
  }[]
  schedule: {
    _id: string
    open: string
    close: string
    id: string
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

export declare interface TrocUserResume {
  troc: string
  user: string
  provided: Article[]
  purchases: Article[]
  givebacks: Article[]
  payments: Article[]
  buySum: number
  paySum: number
  soldSum: number
  feeSum: number
  balance: number
}
