import type { User } from './user'
import type { Troc } from './troc'

export declare interface Subscribe {
  _id: string
  troc: string | Partial<Troc>
  user: Partial<User>
  createdAt: date
  updatedAt: date
}
