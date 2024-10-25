import { Types, model, Schema, Document } from 'mongoose'
import type { Article } from '../../types'
const { ObjectId } = Schema.Types

let articleModel = new Schema({
  trocId: { type: ObjectId, ref: 'troc', required: true, index: true },
  tagId: {
    type: ObjectId,
    required: true,
    index: true,
    default: Types.ObjectId,
  },
  providerSubId: {
    type: ObjectId,
    ref: 'subscribe',
    required: true,
    index: true,
  },

  /** Shortcuts */
  providerId: { type: ObjectId, ref: 'user', index: true },
  buyerId: { type: ObjectId, ref: 'user', index: true },
  validatorId: { type: ObjectId, ref: 'user' },
  sellerId: { type: ObjectId, ref: 'user' },

  // index de création pour préserver l'ordre des articles
  index: { type: Number, default: 0 },
  ref: { type: String, required: true },
  name: { type: String, default: '' },
  price: { type: Number, default: 0, min: 0 },
  fee: { type: Number, default: 0 },
  margin: { type: Number, default: 0 },
  valided: Date, //ou
  refused: Date,
  sold: Date, //ou
  recover: Date,
  corrections: [
    {
      timestamp: Date,
      authorId: { type: ObjectId, ref: 'user', required: true },
      authorSubId: { type: ObjectId, ref: 'subscribe', required: true },
      event: {
        type: String,
        enum: [
          'edit-name',
          'edit-price',
          'cancel-valided',
          'cancel-refused',
          'cancel-sold',
          'cancel-recover',
        ],
      },
      message: String,
      newValue: String,
      oldValue: String,
    },
  ],

  /** @deprecated use corrections */
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
})

articleModel.set('timestamps', true)

function isValidedOrRefused() {
  return !!this.valided || !!this.refused
}

function isSoldOrRecover() {
  return !!this.sold || !!this.recover
}

export default model<Article & Document>('article', articleModel)
