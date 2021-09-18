import { model, Schema, Model, Document } from 'mongoose'
import cc from 'currency-codes'

const ObjectId = Schema.Types.ObjectId
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import type { Troc } from '../../types'

const trocModel = new Schema(
  {
    name: { type: String, required: true },
    is_try: { type: Boolean, default: false },
    society: String,
    societyweb: String,
    currency: { type: String, enum: cc.codes() },
    address: {
      type: String,
      required: notRequiredIfIsTry,
    },
    location: {
      lat: { type: Number, required: notRequiredIfIsTry },
      lng: { type: Number, required: notRequiredIfIsTry },
    },
    description: { type: String, required: true },
    image: { type: String },
    creator: { type: ObjectId, ref: 'user', required: true },
    admin: [{ type: ObjectId, ref: 'user' }],
    cashier: [{ type: ObjectId, ref: 'user' }],
    trader: [
      {
        user: { type: ObjectId, ref: 'user' },
        prefix: { type: String, uppercase: true },
      },
    ],
    schedule: [
      {
        name: {
          type: String,
          enum: ['open', 'deposit', 'recovery', 'sale'],
          default: 'open',
        },
        open: Date,
        close: Date,
        id: false,
      },
    ],
    tarif: [
      {
        name: { type: String, default: 'Tarif' },
        bydefault: { type: Boolean, default: false },
        // Non nécéssaire pour le standard
        apply: [{ type: ObjectId, ref: 'user' }],
        margin: { type: Number, default: 0, min: 0, max: 0.4 },
        fee: [
          {
            price: { type: Number, default: 0, min: 0, max: 100000 },
            value: { type: Number, default: 0, min: 0, max: 100000 },
          },
        ],
        maxarticles: { type: Number, default: 100, min: 1, max: 10000 },
      },
    ],
    articlelastref: { type: Number, required: true, default: 0 },
    tag: {
      width: { type: Number, default: 90 },
      height: { type: Number, default: 29 },
      padding: { type: Number, default: 2 },
      fontSize: { type: Number, default: 16 },
      border: { type: Boolean, default: true },
      useTagPrinter: { type: Boolean, default: false },
      useScanner: { type: Boolean, default: false },
    },
    subscriber: { type: Number, default: 1 },
    articles: { type: Number, default: 0 },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
  }
)

trocModel.virtual('isClosed').get(function () {
  if (!this.schedule[this.schedule.length - 1]) return undefined
  return (
    this.schedule[this.schedule.length - 1].close.getTime() <
    new Date().getTime()
  )
})

trocModel.plugin(mongooseLeanVirtuals)

function notRequiredIfIsTry() {
  return !this.is_try
}

export default model<Troc & Document>('troc', trocModel)
