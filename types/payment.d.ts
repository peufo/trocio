export declare interface PaymentCreate {
  trocId: string
  acceptorSubId: string
  userSubId: string
  amount: number
  message?: string
}

export declare interface PaymentInterface extends PaymentCreate {
  _id: string
  createdAt: Date
  updatedAt: Date
}
