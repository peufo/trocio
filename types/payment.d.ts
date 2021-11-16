export declare interface PaymentCreate {
  userSubId: string
  amount: number
  message?: string
}

export declare interface PaymentInterface extends PaymentCreate {
  _id: string
  trocId: string
  userId: string
  acceptorSubId: string
  acceptorId: string
  createdAt: Date
  updatedAt: Date
}
