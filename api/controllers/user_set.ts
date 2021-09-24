import { RequestHandler } from 'express'

import User from '../models/user'
import Mailvalidator from '../models/mailvalidator'
import mail from './mail'
import randomize from 'randomatic'

export const createUser: RequestHandler = async (req, res, next) => {
  // Dans le cas ou l'utilisateur est déjà connecté
  // Il sagit d'un cassier qui créer un compte pour un client
  // Un mot de passe est générer et returné
  /*
  let genPwd = ''
  if (req.session.user) {
    genPwd = randomize('0', 6)
    req.body.password = genPwd
  }
  */

  try {
    const user = new User(req.body)
    await user.save()
    mail
      .createUser(user, req)
      .catch(() => console.log('Confirmation mail failed'))
    return next()
  } catch (error) {
    if (error.name === 'MongoError' && error.code == 11000) {
      return next(Error('public: Le mail indiqué est déjà utilisé !'))
    }
    next(error)
  }
}

export const patchMe: RequestHandler = (req, res, next) => {
  if (!req.session.user) return next(Error('Login required'))

  User.findById(req.session.user._id, (err, user) => {
    if (err || !user) return next(err || Error('User not found !'))
    if (req.body._id) delete req.body._id
    if (req.body.mailvailded) delete req.body.mailvailded
    if (req.body.trocs) delete req.body.trocs
    if (req.body.loginAttempts) delete req.body.loginAttempts
    for (let p in req.body) {
      user[p] = req.body[p]
    }

    user.save(next)
  })
}

export const changepwd: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.user) throw Error('Login required')
    const { oldPassword, newPassword } = req.body
    const user = await User.getAuthenticated(req.session.user.mail, oldPassword)
    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password changed !' })
  } catch (error) {
    next(error)
  }
}

export const resetpwd: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findOne({ mail: req.body.mail }).exec()
    if (!user) return next('User not found')
    let unchiffredPwd = randomize('Aa0', 10)
    user.password = unchiffredPwd
    await user.save()
    await mail.resetpwd(user, unchiffredPwd)
    res.json({
      success: true,
      message: 'Password reseted, check your mail box !',
    })
  } catch (error) {
    next(error)
  }
}

export const sendValidMail: RequestHandler = (req, res, next) => {
  if (!req.session.user) return next(Error('Login required'))
  mail
    .sendValidMail(req.session.user, req)
    .then(() => {
      res.json({
        success: true,
        message: `Mail sent for validation on address ${req.session.user.mail}`,
      })
    })
    .catch(next)
}

export const validMail: RequestHandler = async (req, res, next) => {
  if (!req.session.user) return next(Error('Login required'))
  try {
    const validator = await Mailvalidator.findOne({
      user: req.session.user._id,
      url: req.params.validator,
    }).exec()
    if (!validator) return next(Error(`MailValidator not exist`))
    const user = await User.findOne({ _id: req.session.user._id }).exec()
    if (!user) return next(Error('User not found'))
    user.mailvalided = true
    await user.save()
    await validator.remove()
    res.json({ success: true, message: 'Email validé' })
  } catch (error) {
    next(error)
  }
}

export default {
  createUser,
  changepwd,
  resetpwd,
  sendValidMail,
  validMail,
  patchMe,
}
