export interface User {
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

export interface UserWithoutId extends Omit<User, '_id'> {}

export interface UserWithRootInfo extends User {
  trocsCount: number
  trocsTryCount: number
}
