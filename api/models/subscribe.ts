import mongoose, { Schema } from 'mongoose'
const { ObjectId } = Schema.Types

let subscribeModel = new Schema({
  user: { type: ObjectId, ref: 'user' },
  troc: { type: ObjectId, ref: 'troc' },
})

subscribeModel.set('timestamps', true)

export default mongoose.model('subscribe', subscribeModel)
