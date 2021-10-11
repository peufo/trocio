import type { User } from './user'
import type { Troc } from './troc'

export declare interface SubscribeBase {
  troc: string
}

export declare interface Subscribe extends SubscribeBase {
  _id: string
  user: string
  createdAt: date
  updatedAt: date

  /** Rôle de l'utilsateur sur le troc */
  role: 'basic' | 'trader' | 'cashier' | 'admin'

  /** L'inscription à été faite ou validé par le participant */
  validedByUser: boolean

  /** L'inscription à été faite ou validé par un organisateur du troc */
  validedByTroc: boolean

  /** Réference vers le tarif qui est attribué au participant */
  tarifId: string

  /** Prefix pour les traders  */
  prefix?: string
}

export declare interface SubscribeLookup extends Subscribe {
  troc: Partial<Troc>
  user: Partial<User>
}
