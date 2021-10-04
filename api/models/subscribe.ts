import mongoose, { Schema } from 'mongoose'
const { ObjectId } = Schema.Types

let subscribeModel = new Schema({
  user: { type: ObjectId, ref: 'user', required: true },
  troc: { type: ObjectId, ref: 'troc', required: true },
  /** L'inscription à été faite ou validé par le participant */
  validedByUser: { type: Boolean, default: false },
  /** L'inscription à été faite ou validé par un organisateur du troc */
  validedByTroc: { type: Boolean, default: false },
  /** Réference vers le tarif qui est attribué au participant */
  tarifId: { type: ObjectId, ref: 'troc.tarif' },
})

subscribeModel.set('timestamps', true)

export default mongoose.model('subscribe', subscribeModel)
