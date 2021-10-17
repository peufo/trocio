export interface IMessage {
  context: 'contact' | 'private' | 'comment'
  content: string
  createdAt: Date
  updatedAt: Date

  /** Soit l'un, soit l'autre */
  authorId?: string
  authorMail?: string

  /** context === 'private' */
  destinaterId?: string
  /** context === 'comment' */
  messageId?: string
  trocId?: string
  articleId?: string
}
