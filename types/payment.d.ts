export declare interface PaymentCreate {
  acceptor: string
  user: string
  troc: string
  amount: number
  message?: string
}

export declare interface PaymentInterface extends PaymentCreate {
  _id: string
  createdAt: Date
  updatedAt: Date
}
