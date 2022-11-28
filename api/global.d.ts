import type { User } from '../types'

declare module 'express-session' {
  interface SessionData {
    user: User
  }
}

export {}
