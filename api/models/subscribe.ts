import mongoose, { Schema, Document } from 'mongoose'
const { ObjectId } = Schema.Types

import type { ISubscribe } from '../../types'

let subscribeModel = new Schema({
  /** @deprecated please use trocId */
  troc: { type: ObjectId, ref: 'troc' },
  /** @deprecated please, use userId*/
  user: { type: ObjectId, ref: 'user' },

  trocId: { type: ObjectId, ref: 'troc', required: true },
  userId: { type: ObjectId, ref: 'user', required: true },

  /** Rôle de l'utilsateur sur le troc */
  role: {
    type: String,
    enum: ['basic', 'trader', 'cashier', 'admin'],
    default: 'basic',
  },

  /** L'inscription à été faite ou validé par le participant */
  validedByUser: { type: Boolean, default: false },

  /** L'inscription à été faite ou validé par un organisateur du troc */
  validedByTroc: { type: Boolean, default: false },

  /** Réference vers le tarif qui est attribué au participant */
  tarifId: { type: ObjectId, ref: 'troc.tarif' },

  /** Prefix pour les traders  */
  prefix: { type: String, uppercase: true, required: requiredIfRoleIsTrader },
})

subscribeModel.set('timestamps', true)

function requiredIfRoleIsTrader() {
  return this.role === 'trader'
}

export default mongoose.model<ISubscribe & Document>(
  'subscribe',
  subscribeModel
)
