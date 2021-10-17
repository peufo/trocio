import type { User } from './user'
import type { Troc, Tarif } from './troc'
import type Tarif__SvelteComponent_ from '$lib/troc/Tarif.svelte'

export interface SubscribeBase {
  trocId: string
}

export interface ISubscribe extends SubscribeBase {
  _id: string
  userId: string
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

export interface SubscribeLookup extends ISubscribe {
  troc: Partial<Troc>
  user: Partial<User>
}

/** Résumé des interactions d'un utilisateur avec un troc */
export interface SubscribeResum extends ISubscribe {
  balance: number
  providedCount?: number
  providedSum?: number
  feeSum?: number
  soldSum?: number
  marginSum?: number
  purchasesCount?: number
  purchasesSum?: number
  paymentsCount?: number
  paymentsSum?: number
  tarif: Tarif
}
