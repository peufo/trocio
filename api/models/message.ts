import { model, Schema, Model, Document } from 'mongoose'
import type { IMessage } from '../../types'

const { ObjectId } = Schema.Types

const messageModel = new Schema(
  {
    context: {
      type: String,
      enum: ['contact', 'private', 'comment'],
      required: true,
    },
    content: { type: String, trim: true, minLengt: 1, required: true },
    authorId: {
      type: ObjectId,
      ref: 'user',
      required: notRequiredIfAuthorMail,
    },
    authorMail: {
      type: ObjectId,
      ref: 'user',
      required: notRequiredIfAuthorId,
    },
    destinaterId: { type: ObjectId, ref: 'user', required: requiredIfPrivate },

    /** context === 'comment' */
    messageId: { type: ObjectId, ref: 'message', required: requiredIfComment },
    trocId: { type: ObjectId, ref: 'troc', required: requiredIfComment },
    articleId: { type: ObjectId, ref: 'article', required: requiredIfComment },
  },
  {
    timestamps: true,
  }
)

function notRequiredIfAuthorMail() {
  return !this.authorMail
}
function notRequiredIfAuthorId() {
  return !this.authorId
}
function requiredIfPrivate() {
  return this.context === 'private'
}
function requiredIfComment() {
  return this.context === 'comment'
}

export default model<IMessage & Document>('message', messageModel)
