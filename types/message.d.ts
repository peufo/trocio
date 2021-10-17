export interface IMessageCreate {
  /** Si absent, l'utilisateur connecté est utilisé pour authorId */
  authorMail?: string
  content: string
}

export interface IMessage extends IMessageCreate {
  authorId?: string
  context: 'contact' | 'private' | 'comment'
  createdAt: Date
  updatedAt: Date

  /** context === 'private' */
  destinaterId?: string
  /** context === 'comment' */
  messageId?: string
  trocId?: string
  articleId?: string
}
