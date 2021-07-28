import type { RequestHandler } from 'express'

import UserModel from '../models/user'

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.user) throw Error('public: Login required')

    const user = await UserModel.findOne({ _id: req.session.user._id }).exec()

    if (!user) throw Error('User not found !')

    return res.json(user)
  } catch (error) {
    return next(error)
  }
}

export function searchUser(req, res, next) {
  const { q = '', skip = 0, limit = 10 } = req.query
  let regexp = new RegExp(q, 'i')
  UserModel.find(
    { $or: [{ name: regexp }, { mail: regexp }] },
    { name: 1, mail: 1 }
  )
    .skip(skip)
    .limit(limit)
    .lean()
    .exec((err, users) => {
      if (err) return next(err)
      users.forEach(hideMail)
      res.json(users)
    })
}

export function getUser(req, res, next) {
  UserModel.findById(req.params.userId)
    .lean()
    .exec((err, user) => {
      if (err || !user) return next(err || Error('User not found'))
      delete user.password
      res.json(user)
    })
}

export function getUserName(req, res, next) {
  UserModel.findOne({ _id: req.params.userId }, 'name')
    .lean()
    .exec((err, user) => {
      if (err || !user) return next(err || Error('User not found'))
      res.json(user)
    })
}

export function hideMail(user) {
  let index = user.mail.indexOf('@')
  if (index > -1) {
    user.mail = user.mail.replace(
      user.mail.slice(2, index - 1),
      '*'.repeat(index - 3)
    )
  } else {
    user.mail = 'Invalid mail'
  }
}

export default {
  getMe,
  searchUser,
  getUser,
  getUserName,
}
