import { model, Schema, Document } from 'mongoose'
import cc from 'currency-codes'

const ObjectId = Schema.Types.ObjectId
import mongooseLeanVirtuals from 'mongoose-lean-virtuals'
import type { Troc } from '../../types'
import { EMAIL_REGEX } from './utils'

const trocModel = new Schema(
  {
    name: { type: String, required: true },
    is_try: { type: Boolean, default: false },
    society: { type: String, required: true },
    societyweb: String,
    societyPhone: String,
    societyMail: {
      type: String,
      lowercase: true,
      required: false,
      validate: {
        validator: (value: string) => {
          if (!value) return true
          if (typeof value !== 'string') return false
          return !!value.match(EMAIL_REGEX)
        },
        message: 'Is not valid email',
      },
    },
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
    creator: { type: ObjectId, ref: 'user', required: true },

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
        margin: { type: Number, default: 0, min: 0, max: 1 },
        fee: [
          {
            price: { type: Number, default: 0, min: 0, max: 100000 },
            value: { type: Number, default: 0, min: 0, max: 100000 },
          },
        ],
        maxarticles: { type: Number, default: 100, min: 0, max: 10000 },
      },
    ],
    articlelastref: { type: Number, required: true, default: 0 },
    tag: {
      width: { type: Number, default: 95 },
      height: { type: Number, default: 30 },
      padding: { type: Number, default: 2 },
      fontSize: { type: Number, default: 16 },
      border: { type: Boolean, default: true },
      useTagPrinter: { type: Boolean, default: false },
      useScanner: { type: Boolean, default: true },
    },
  },
  {
    toJSON: { virtuals: true },
    timestamps: true,
  }
)

/*
trocModel.virtual('isClosed').get(function () {
  if (!this.schedule[this.schedule.length - 1]) return undefined
  return (
    this.schedule[this.schedule.length - 1].close.getTime() <
    new Date().getTime()
  )
})
*/

trocModel.plugin(mongooseLeanVirtuals)

function notRequiredIfIsTry() {
  return !this.is_try
}

export default model<Troc & Document>('troc', trocModel)
