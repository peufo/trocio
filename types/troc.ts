import type { Article } from 'types'
import type { User } from 'types'
import type { IPayment } from './payment'
import type { ISubscribe } from './subscribe'

/** Période dont est composé l'horaire */
export declare interface Period {
  _id?: string
  name?: 'open' | 'deposit' | 'recovery' | 'sale' | 'delete'
  open: string
  close: string
}

/** Tarif */
export declare interface Tarif {
  _id?: string
  name: string
  bydefault: boolean
  margin: number
  fee: {
    price: number
    value: number
  }[]
  maxarticles: number
}

/** Tag (config étiquettes) */
export declare interface TagInterface {
  width: number
  height: number
  padding: number
  fontSize: 16
  border: boolean
  useTagPrinter: boolean
  useScanner: boolean
}

/** Information minimal pour la création d'un troc */
export declare interface TrocBase {
  name: string
  description: string
  is_try: boolean
  currency: string
  address?: string
  location?: {
    lat: number
    lng: number
  }
  schedule?: Period[]
  society: string
  societyMail: string
  societyweb?: string
  societyPhone?: string
}

/** Information complette d'un troc */
export interface Troc extends TrocBase {
  _id: string
  tag: TagInterface
  articlelastref: number
  creator: string | User
  tarif: Tarif[]
  createdAt: string
  updatedAt: string
  __v: 0
  id: string
  isAdmin: boolean
  isCashier: boolean
  isSubscribed: boolean
  // Computed from schedule
  isClosed: boolean
  isOpen: boolean
}

/** Information complette avec les informations collaborateurs */
export interface TrocLookup extends Troc {
  creator: User
  subscribe: ISubscribe
}

/** Statistique d'un troc */
export declare interface TrocStats {
  articlesProposed: Article[]
  articlesBuyed: Article[]
  payments: IPayment[]
}

interface ITrocsMapQuery {
  north?: number
  east?: number
  sud?: number
  west?: number
}
interface ITrocsFilterQuery {
  search?: string
  start?: string
  end?: string
}

export interface SearchTrocsQuery extends ITrocsMapQuery, ITrocsFilterQuery {
  _id?: string
}
