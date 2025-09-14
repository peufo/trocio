import type { RequestHandler } from "express";
import qs from "qs";
import randomize from "randomatic";

import UserModel from "../models/user.js";
import config from "../config.js";
import mail from "./mail.js";
import { User } from "../../src/lib/types/index.js";

const { VITE_TROCIO_GOOGLE_CLIENT_ID, TROCIO_GOOGLE_CLIENT_SECRET } = config;

export const login: RequestHandler = async (req, res, next) => {
  const { mail, password } = req.body;
  if (!mail || !password) return next(Error("mail and password required"));

  UserModel.getAuthenticated(mail, password)
    .then((user) => {
      console.log(`Nouvelle connexion de ${user.name}`);
      req.session.user = user as User;
      next();
    })
    .catch(next);
};

export const loginWithGoogle: RequestHandler = async (req, res, next) => {
  const { code, error, state } = req.query;
  if (error) return next(error);
  if (!state || typeof state !== "string")
    return next(Error("state need to be a string"));

  const host = state.match(/^(http|https):\/\/[^\/]+/)?.[0];

  const body = qs.stringify({
    client_id: VITE_TROCIO_GOOGLE_CLIENT_ID,
    client_secret: TROCIO_GOOGLE_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: `${host}/api/users${req.path}`,
  });

  fetch("https://oauth2.googleapis.com/token", {
    method: "post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  })
    .then(async (response) => {
      const { access_token } = await response.json();
      if (!access_token) return next("ccess_token not provideda");

      const url = new URL("https://openidconnect.googleapis.com/v1/userinfo");
      url.searchParams.set("access_token", access_token);

      fetch(url)
        .then(async (response) => {
          try {
            const { email, email_verified, name } = await response.json();

            //Trouve l'utilisateur
            let user = await UserModel.findOne({ mail: email }).exec();

            if (!user) {
              //Sinon créer un compte
              user = new UserModel({
                name,
                mail: email,
                mailvalided: email_verified,
                password: [
                  randomize("0000"),
                  randomize("0000"),
                  randomize("0000"),
                ].join("-"),
              });
              await user.save();
              mail
                .createUser(user, req.get("origin"))
                .catch(() => console.log("Confirmation mail failed"));
              console.log(`Nouvelle utilisateur: ${user.name}`);
            }
            console.log(`Nouvelle connexion de ${user.name}`);
            req.session.user = user as User;

            return res.redirect(state);
          } catch (err) {
            return next(err);
          }
        })
        .catch(next);
    })
    .catch(next);
};

export function logout(req, res, next) {
  if (!req.session.user) return next(Error("No connected"));

  req.session.user = undefined;
  res.json({ success: true, message: "user logged out" });
}

export default {
  login,
  logout,
  loginWithGoogle,
};
