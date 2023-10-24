import { Schema, model, Document } from 'mongoose'
const ObjectId = Schema.Types.ObjectId

import type { User } from '../../types'

export interface IToken {
  user: string | User
  type: 'emailVerification' | 'passwordReset'
  value: string
  validity: number
}

const tokenShema = new Schema({
  user: { type: ObjectId, ref: 'user', required: true },
  type: { type: String, enum: ['emailVerification', 'passwordReset'] },
  value: { type: String, required: true },
  validity: { type: Date, default: +new Date() + 24 * 60 * 60 * 1000 },
})

export default model<IToken & Document>('token', tokenShema)
