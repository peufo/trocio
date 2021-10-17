import { model, Schema, Model, Document } from 'mongoose'
import type { IMessage } from '../../types'

const { ObjectId } = Schema.Types
const EMAIL_REGEX =
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

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
      type: String,
      required: notRequiredIfAuthorId,
      lowercase: true,
      validate: EMAIL_REGEX,
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
