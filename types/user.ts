export type User = {
  _id: string
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
  lastLogin: Date
}

export type UserWithoutId = Omit<User, '_id'>

export type UserWithRootInfo = User & {
  trocs?: {
    count: number
    countTry: number
  }
}
