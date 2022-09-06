import mongoose, { model, Schema, Document, Model, VirtualType } from 'mongoose'
import bcrypt from 'bcrypt'

import mail from '../controllers/mail'
import type { UserWithoutId } from '../../types'
import { EMAIL_REGEX } from './utils'

const SALT_WORK_FACTOR = 10
const MAX_LOGIN_ATTEMPTS = 12
const LOCK_TIME = 2 * 60 * 60 * 1000 // 2h

export interface UserDocument extends UserWithoutId, Document {
  isLocked: boolean
  comparePassword(candidatePassword: string): Promise<boolean>
  getAuthenticated(mail: string, password: string): Promise<UserDocument>
  incLoginAttempts(): Promise<UserDocument>
}

export interface UserModel extends Model<UserDocument> {}

const userSchema = new Schema<UserDocument, UserModel>({
  name: { type: String, required: true },
  ref: Number, //Old id
  birth: Date,
  phone: String,
  mail: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
    validate: EMAIL_REGEX,
  },
  mailvalided: { type: Boolean, default: false },
  password: { type: String, required: true },
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: Number,
  creditTroc: { type: Number, default: 0 },
  acceptTerms: { type: Boolean, default: false },
})

userSchema.set('timestamps', true)

userSchema.virtual('isLocked').get(function (this: UserDocument) {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

userSchema.pre<UserDocument>('save', async function (next) {
  // Hash password
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR)
    const hash = await bcrypt.hash(this.password, salt)
    this.password = hash
  }
  // Invalid mail
  if (this.isModified('mail') && !this.isNew) {
    this.mailvalided = false
  }
})

userSchema.methods.comparePassword = function (
  this: UserDocument,
  candidatePassword: string
) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.incLoginAttempts = async function (this: UserDocument) {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    }).exec()
  }
  const updates = { $inc: { loginAttempts: 1 }, $set: {} }
  if (!this.isLocked && this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME }
  }

  return this.updateOne(updates).exec()
}

userSchema.statics.getAuthenticated = async function (
  this: Model<UserDocument>,
  mail: string,
  password: string
) {
  const user = await this.findOne({ mail }).exec()
  if (!user)
    throw Error(`public: Le mail indiqué n'est pas associé à un compte!`)
  if (user.isLocked) {
    throw Error(`public: Ce compte est temporairement verrouillé!`)
  }

  const isMatch = await user.comparePassword(password)
  if (!isMatch) {
    await user.incLoginAttempts()
    throw Error('public: Mot de passe invalide!')
  }

  await user
    .updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 },
    })
    .exec()

  return user
}

export default model<UserDocument, UserModel>('user', userSchema)
