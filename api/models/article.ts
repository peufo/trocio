import mongoose, { Schema } from 'mongoose'
const { ObjectId } = Schema.Types

let articleModel = new Schema({
  trocId: { type: ObjectId, ref: 'troc', required: true, index: true },
  providerSubId: {
    type: ObjectId,
    ref: 'subscribe',
    required: true,
    index: true,
  },
  /*
  providerId: { type: ObjectId, ref: 'user', required: true, index: true },
  buyerId: { type: ObjectId, ref: 'user', index: true },
  validatorId: { type: ObjectId, ref: 'user' },
  sellerId: { type: ObjectId, ref: 'user' },
  */
  ref: { type: String, required: true },
  name: { type: String, default: '' },
  price: { type: Number, default: 0, min: 0 },
  fee: { type: Number, default: 0 },
  margin: { type: Number, default: 0 },
  valided: Date, //ou
  refused: Date,
  sold: Date, //ou
  recover: Date,
  giveback: [
    {
      sold: Date,
      back: Date,
      raison: String,
      /** @deprecated use giveback.subscribeId */
      user: { type: ObjectId, ref: 'user' },
      subscribeId: { type: ObjectId, ref: 'subscribe' },
    },
  ],
  buyerSubId: { type: ObjectId, ref: 'subscribe', index: true },
  validatorSubId: {
    type: ObjectId,
    ref: 'subscribe',
    required: isValidedOrRefused,
  },
  sellerSubId: { type: ObjectId, ref: 'subscribe', required: isSoldOrRecover },
  /** @deprecated */
  troc: { type: ObjectId, ref: 'troc' },
  /** @deprecated  */
  provider: { type: ObjectId, ref: 'user' },
  /** @deprecated  */
  buyer: { type: ObjectId, ref: 'user' },
  /** @deprecated  */
  validator: { type: ObjectId, ref: 'user' },
  /** @deprecated  */
  seller: { type: ObjectId, ref: 'user' },
  /** @deprecated */
  newPriceRequest: {
    applicant: { type: ObjectId, ref: 'user' },
    createdAt: Date,
    price: Number,
  },
})

articleModel.set('timestamps', true)

//TODO: Add pre('save price') and compute fee and margin

function isValidedOrRefused() {
  return !!this.valided || !!this.refused
}

function isSoldOrRecover() {
  return !!this.sold || !!this.recover
}

export default mongoose.model('article', articleModel)
