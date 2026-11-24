export interface IPaymentCreate {
  userSubId: string
  amount: number
  message?: string
}

export interface IPayment extends IPaymentCreate {
  _id: string
  trocId: string
  userId: string
  acceptorSubId: string
  acceptorId: string
  createdAt: Date
  updatedAt: Date
}

export interface IPaymentLookup extends IPayment {
  acceptor: {
    _id: string
    name: string
  }
  user?: {
    _id: string
    name: string
  }
  /** Participation du client, pour le nom des participants sans compte */
  userSub?: {
    _id: string
    name: string
  }
}

/** Nombre et sommes des paiements correspondant à un filtre */
export interface IPaymentResum {
  count: number
  /** Somme de tous les montants */
  sum: number
  /** Somme des montants encaissés (client → troc, positifs) */
  sumIn: number
  /** Somme des montants versés (troc → client, négatifs) */
  sumOut: number
}
