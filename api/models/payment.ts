import mongoose, { Schema } from 'mongoose'
const { ObjectId } = Schema.Types

var paymentModel = new Schema({
  trocId: { required: true, type: ObjectId, ref: 'troc', index: true },
  acceptorSubId: { required: true, type: ObjectId, ref: 'subscribe' },
  userSubId: { type: ObjectId, ref: 'subscribe', index: true },
  amount: { required: true, type: Number },
  message: String,

  /** @deprecated use acceptorSubId */
  acceptor: { type: ObjectId, ref: 'user' },
  /** @deprecated use userSubId */
  user: { type: ObjectId, ref: 'user' },
  /** @deprecated use trocId */
  troc: { type: ObjectId, ref: 'troc' },
})

paymentModel.set('timestamps', true)

export default mongoose.model('payment', paymentModel)
