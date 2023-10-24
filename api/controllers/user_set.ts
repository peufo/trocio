import type { RequestHandler } from 'express'

import User from '../models/user'
import mail from './mail'
import randomize from 'randomatic'
import { validateToken } from './token'

export const createUser: RequestHandler = async (req, res, next) => {
  try {
    const { origin } = req.query
    if (typeof origin !== 'string') throw 'origin query is required'
    const user = new User(req.body)
    await user.save()
    mail
      .createUser(user, req.get('origin'))
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

export const sendResetPwd: RequestHandler = async (req, res, next) => {
  try {
    const user = await User.findOne({ mail: req.body.mail }).exec()
    if (!user) return next('User not found')

    await mail.sendResetPwd(user, req.get('origin'))
    res.json({
      success: true,
      message: 'Un lien vous à été envoyé. Vérifiez votre boîte mail !',
    })
  } catch (error) {
    next(error)
  }
}

export const resetpwd: RequestHandler = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body
    if (typeof token !== 'string') throw Error('token (string) is required')
    if (typeof newPassword !== 'string')
      throw Error('newPassword (string) is required')

    const userId = await validateToken('passwordReset', token)
    const user = await User.findById(userId)
    user!.password = newPassword
    await user?.save()
    req.session.user = user

    res.json({
      success: true,
      message: 'Password reseted, check your mail box !',
    })
  } catch (error) {
    next(error)
  }
}

export const sendValidMail: RequestHandler = async (req, res, next) => {
  try {
    const { origin } = req.query
    if (!req.session.user) throw 'Login required'
    if (typeof origin !== 'string') throw 'origin query is required'

    await mail.sendValidMail(req.session.user, origin)

    res.json({
      success: true,
      message: `Mail sent for validation on address ${req.session.user.mail}`,
    })
  } catch (error) {
    next(error)
  }
}

export const validMail: RequestHandler = async (req, res, next) => {
  try {
    const { token } = req.body
    if (typeof token !== 'string') throw Error('token (string) is required')
    const userId = await validateToken('emailVerification', token)

    const user = await User.findByIdAndUpdate(userId, {
      mailvalided: true,
    }).exec()
    if (!user) return next(Error('User not found'))
    // Auto-login
    req.session.user = user

    res.json({ success: true, message: 'Email validé' })
  } catch (error) {
    next(error)
  }
}

export default {
  createUser,
  changepwd,
  sendResetPwd,
  resetpwd,
  sendValidMail,
  validMail,
  patchMe,
}
