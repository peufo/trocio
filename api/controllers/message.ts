import { RequestHandler } from 'express'
import Message from '../models/message'
import User from '../models/user'
import { transporter } from './mail'

export const createContact: RequestHandler = async (req, res, next) => {
  try {
    let { authorMail, content } = req.body
    if (!req.session.user && !authorMail)
      throw 'authorMail field is required for not connected author'
    if (req.session.user && authorMail)
      throw `authorMail field can't be used for connected author`
    if (!content) throw 'content field is required'

    if (req.session.user) {
      await new Message({
        content,
        authorId: req.session.user._id,
        context: 'contact',
      }).save()
    } else {
      await new Message({ content, authorMail, context: 'contact' }).save()
    }

    const mailTo = req.session.user?.mail || authorMail

    // Renvoi une confirmation à l'auteur
    await transporter.sendMail({
      from: 'TROCIO <postmaster@trocio.ch>',
      to: mailTo,
      subject: 'Merci pour votre message',
      html: `
        <h2>Merci pour votre message</h2>
        <p>Nous vous répondrons aussi rapidement que possible.</p>
        <p>
            Contenu de votre message :
            <blockquote>${content}</blockquote>
        </p>
      `,
    })

    res.json({ success: true, message: 'Message envoyé' })
  } catch (error) {
    next(error)
  }
}
