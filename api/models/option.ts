import { model, Schema, Document } from 'mongoose'
const { ObjectId } = Schema.Types
import type { Option } from '../../types'

const optionModel = new Schema({
  name: { type: String, unique: true, required: true },
  value: { type: String, required: true },
  description: String,
})

optionModel.set('timestamps', true)

export default model<Option & Document>('option', optionModel)
