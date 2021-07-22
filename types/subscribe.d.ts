import type { User } from './user'
import type { Troc } from './troc'

export declare interface SubscribeBase {
  troc: string
}

export declare interface Subscribe extends SubscribeBase {
  _id: string
  user: string
  createdAt: date
  updatedAt: date
}

export declare interface SubscribeLookup extends Subscribe {
  troc: Partial<Troc>
  user: Partial<User>
}
