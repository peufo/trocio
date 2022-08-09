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
}
