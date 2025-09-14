import nodemailer, { type SendMailOptions } from "nodemailer";

import type { User } from "../../src/lib/types/index.js";
import config from "../../config.js";
import { generateToken } from "./token.js";

const {
  TROCIO_URL,
  TROCIO_SMTP_HOST,
  TROCIO_SMTP_PORT,
  TROCIO_SMTP_PASS,
  TROCIO_SMTP_USER,
} = config;

export const transporter = nodemailer.createTransport({
  host: TROCIO_SMTP_HOST,
  port: TROCIO_SMTP_PORT,
  auth: {
    user: TROCIO_SMTP_USER,
    pass: TROCIO_SMTP_PASS,
  },
});

transporter.verify(function (err, success) {
  if (err) {
    console.log("Mail configuration ERROR");
  } else {
    console.log("Mail configuration SUCCESS");
  }
});

const mailOptions: SendMailOptions = {
  from: `Troc.io <${TROCIO_SMTP_USER}>`,
};

export async function createUser(user: User, origin = TROCIO_URL) {
  const emailVerificationToken = await generateToken(
    "emailVerification",
    user._id
  );
  const basePath = `${origin}/mail-validation`;
  const params = `user=${user._id}&token=${emailVerificationToken}`;
  const href = `${basePath}?${params}`;

  mailOptions.to = user.mail;
  mailOptions.subject = "Création de votre compte - TROCIO";
  mailOptions.html = `
    <h2>Bienvenue sur Trocio</h2>
    <p>
        <b>${user.name}</b>, votre inscription s'est correctement déroulée. 
    </p>
    <p>
        <a href="${href}">
            Cliquer ici pour valider votre adresse mail.
        </a>
    </p>
  `;
  return await transporter.sendMail(mailOptions);
}

export async function sendValidMail(user: User, origin = TROCIO_URL) {
  const emailVerificationToken = await generateToken(
    "emailVerification",
    user._id
  );
  const basePath = `${origin}/mail-validation`;
  const params = `token=${emailVerificationToken}`;
  const href = `${basePath}?${params}`;
  mailOptions.to = user.mail;
  mailOptions.subject = "Validation de votre mail - TROCIO";
  mailOptions.html = `
      <h2>Validation de votre adresse email</h2>
      <p>
          <a href="${href}">
              Cliquer ici pour valider votre adresse mail.
          </a>
      </p>
    `;
  return await transporter.sendMail(mailOptions);
}

export async function sendResetPwd(user: User, origin = TROCIO_URL) {
  const resetPwdToken = await generateToken("passwordReset", user._id);

  const href = `${origin}/password-reset?token=${resetPwdToken}`;

  mailOptions.to = user.mail;
  mailOptions.subject = "TROCIO - Mot de passe oublié";
  mailOptions.html = `
      <h2>Demande de changement de mot de passe</h2>
      <p>
          Bonjour ${user.name}, vous avez fait une demande de changement de mot de passe.
      </p>
      <p>
        <a href="${href}">Cliquer ici pour le changer.</a>
      </p>
  `;
  return await transporter.sendMail(mailOptions);
}

export default { createUser, sendValidMail, sendResetPwd };
