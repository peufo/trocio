import UserModel from '../models/user'
import createError from 'http-errors'
import config from '../../config'
import axios from 'axios'
import qs from 'qs'
import mail from './mail'
import randomize from 'randomatic'

const {
  TROCIO_ADMIN,
  VITE_TROCIO_GOOGLE_CLIENT_ID,
  TROCIO_GOOGLE_CLIENT_SECRET,
} = config

export function checkSuperAdmin(req, res, next) {
  if (!req.session.user) return next(createError(401))
  if (!TROCIO_ADMIN)
    return next(Error('The environment variable TROCIO_ADMIN is undefined'))
  if (TROCIO_ADMIN != req.session.user.mail) return next(Error('Access denied'))
  next()
}

export async function login(req, res, next) {
  const { mail, password } = req.body
  if (!mail || !password) return next(Error('mail and password required'))
  UserModel.getAuthenticated(mail, password)
    .then((user) => {
      console.log(`Nouvelle connexion de ${user.name}`)
      req.session.user = user
      delete req.session.user.password //TODO: not work ?
      next()
    })
    .catch(next)
}

export async function loginWithGoogle(req, res, next) {
  const { code, error, state } = req.query
  if (error) return next(error)

  const host = state.match(/^(http|https):\/\/[^\/]+/)[0]

  const data = qs.stringify({
    client_id: VITE_TROCIO_GOOGLE_CLIENT_ID,
    client_secret: TROCIO_GOOGLE_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: `${host}/api/users${req.path}`,
  })

  axios({
    method: 'post',
    url: 'https://oauth2.googleapis.com/token',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data,
  })
    .then(function (response) {
      const { access_token } = response.data
      if (!access_token) return next('ccess_token not provideda')

      axios
        .get(`https://openidconnect.googleapis.com/v1/userinfo`, {
          params: { access_token },
        })
        .then(async function (response) {
          const { email, email_verified, name } = response.data

          try {
            //Trouve l'utilisateur
            let user = await UserModel.findOne({ mail: email }).exec()

            if (!user) {
              //Sinon créer un compte
              user = new UserModel({
                name,
                mail: email,
                mailvalided: email_verified,
                password: [
                  randomize('0000'),
                  randomize('0000'),
                  randomize('0000'),
                ].join('-'),
              })
              await user.save()
              mail
                .createUser(user)
                .catch(() => console.log('Confirmation mail failed'))
              console.log(`Nouvelle utilisateur: ${user.name}`)
            }
            console.log(`Nouvelle connexion de ${user.name}`)
            req.session.user = user

            return res.redirect(state)
          } catch (err) {
            return next(err)
          }
        })
        .catch(next)
    })
    .catch(next)
}

export function logout(req, res, next) {
  if (!req.session.user) return next(Error('No connected'))
  req.session.user = undefined
  res.json({ success: true, message: 'user logged out' })
}

export default {
  checkSuperAdmin,
  login,
  logout,
  loginWithGoogle,
}
