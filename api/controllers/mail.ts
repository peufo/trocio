import nodemailer, { SendMailOptions } from 'nodemailer'
import randomize from 'randomatic'

import MailValidatorModel, { MailValidator } from '../models/mailvalidator'
import type { User } from '../../types'
import config from '../../config'

const {
  TROCIO_SMTP_HOST,
  TROCIO_SMTP_PORT,
  TROCIO_SMTP_PASS,
  TROCIO_SMTP_USER,
  TROCIO_HOSTNAME,
} = config

export const transporter = nodemailer.createTransport({
  host: TROCIO_SMTP_HOST,
  port: TROCIO_SMTP_PORT,
  auth: {
    user: TROCIO_SMTP_USER,
    pass: TROCIO_SMTP_PASS,
  },
})

transporter.verify(function (err, success) {
  if (err) {
    console.log('Mail configuration error')
  } else {
    console.log('Server is ready to take our messages')
  }
})

const mailOptions: SendMailOptions = {
  from: 'TROCIO <postmaster@trocio.ch>',
}

export async function createUser(user: User) {
  const validator = await getUrlValidMail(user._id)
  mailOptions.to = user.mail
  mailOptions.subject = 'Création de votre compte - TROCIO'
  mailOptions.html = `
    <h2>Bienvenue sur Trocio</h2>
    <p>
        <b>${user.name}</b>, votre inscription s'est correctement déroulée. 
    </p>
    <p>
        <a href="${TROCIO_HOSTNAME}/mail-validation?user=${user._id}&validator=${validator.url}">
            Cliquer ici pour valider votre adresse mail.
        </a>
    </p>
  `
  return await transporter.sendMail(mailOptions)
}

export async function sendValidMail(user: User) {
  const validator = await getUrlValidMail(user._id)
  mailOptions.to = user.mail
  mailOptions.subject = 'Validation de votre mail - TROCIO'
  mailOptions.html = `
      <h2>Validation de votre adresse mail</h2>
      <p>
          <a href="${TROCIO_HOSTNAME}/mail-validation?user=${user._id}&validator=${validator.url}">
              Cliquer ici pour valider votre adresse mail.
          </a>
      </p>
    `
  return await transporter.sendMail(mailOptions)
}

export async function resetpwd(user: User, unchiffredPwd: string) {
  mailOptions.to = user.mail
  mailOptions.subject = 'Réinitialisation de votre mot de passe - TROCIO'
  mailOptions.html = `
        <h2>Votre mot de passe a été réinitialisé</h2>
        <p>
            ${user.name}, votre nouveau mot de passe est désormais : <b>${unchiffredPwd}</b>
        </p>
    `
  return await transporter.sendMail(mailOptions)
}

async function getUrlValidMail(userId: string): Promise<MailValidator> {
  const validator = await MailValidatorModel.findOne({ user: userId }).exec()
  if (validator) {
    validator.validity = +new Date() + 10 * 60 * 60 * 1000
    validator.url = randomize('a0', 256)
    await validator.save()
    return validator
  } else {
    const newValidator = new MailValidatorModel({
      user: userId,
      url: randomize('a0', 256),
    })
    await newValidator.save()
    return newValidator
  }
}

export default { createUser, sendValidMail, resetpwd }
