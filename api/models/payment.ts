import mongoose, { Schema } from 'mongoose'
const { ObjectId } = Schema.Types

var paymentModel = new Schema({
  acceptor: { required: true, type: ObjectId, ref: 'user' },
  user: { type: ObjectId, ref: 'user' },
  troc: { required: true, type: ObjectId, ref: 'troc' },
  amount: { required: true, type: Number },
  message: String,
})

paymentModel.set('timestamps', true)

export default mongoose.model('payment', paymentModel)