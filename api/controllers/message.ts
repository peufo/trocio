import type { RequestHandler } from "express";

import Message from "../models/message.js";
import { transporter } from "./mail.js";
import config from "../config.js";

export const createContact: RequestHandler = async (req, res, next) => {
  try {
    let { authorMail, content } = req.body;
    if (!req.session.user && !authorMail)
      throw "authorMail field is required for not connected author";
    if (req.session.user && authorMail)
      throw `authorMail field can't be used for connected author`;
    if (!content) throw "content field is required";

    if (req.session.user) {
      await new Message({
        content,
        authorId: req.session.user._id,
        context: "contact",
      }).save();
    } else {
      await new Message({ content, authorMail, context: "contact" }).save();
    }

    // Renvoi une confirmation à l'auteur
    await transporter.sendMail({
      from: `Troc.io <${config.TROCIO_SMTP_USER}>`,
      to: req.session.user?.mail || authorMail,
      subject: "Merci pour votre message",
      html: `
        <h2>Merci pour votre message</h2>
        <p>Nous vous répondrons aussi rapidement que possible.</p>
        <p>
            Contenu de votre message :
            <blockquote>${content}</blockquote>
        </p>
      `,
    });

    // Envoie le message sur la boite info@trocio.ch
    await transporter.sendMail({
      from: `Troc.io <${config.TROCIO_SMTP_USER}>`,
      to: "info@trocio.ch",
      replyTo: req.session.user?.mail || authorMail,
      subject: `Nouveau message de [${req.session.user?.name || "inconu"}]`,
      html: `
            <p>${content}</p>
          `,
    });

    res.json({ success: true, message: "Message envoyé" });
  } catch (error) {
    next(error);
  }
};
