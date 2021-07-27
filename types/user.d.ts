export declare interface User {
  // _id?: string Pour le model mongoose
  name: string
  ref?: number
  birth?: Date
  phone?: string
  mail: string
  mailvalided: boolean
  password: string
  loginAttempts: number
  lockUntil: number
  creditTroc: number
  acceptTerms: boolean
}
