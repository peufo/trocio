import mongoose, { Schema, model, Document } from 'mongoose'
const ObjectId = Schema.Types.ObjectId

import type { User } from '../../types'

export interface MailValidator {
  user: string | User
  url: string
  validity: number
}

const mailValidatorModel = new Schema({
  user: { type: ObjectId, ref: 'user', required: true },
  url: { type: String, required: true },
  validity: { type: Date, default: +new Date() + 2 * 60 * 60 * 1000 },
})

export default model<MailValidator & Document>(
  'mailvalidator',
  mailValidatorModel
)
