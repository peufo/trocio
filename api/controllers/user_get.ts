import type { RequestHandler } from 'express'
import mongoose from 'mongoose'
import UserModel from '../models/user'

export const getMe: RequestHandler = async (req, res, next) => {
  try {
    if (!req.session.user) throw Error('public: Login required')

    const user = await UserModel.findOne(
      { _id: req.session.user._id },
      { password: 0 }
    ).exec()

    if (!user) throw Error('User not found !')

    return res.json(user)
  } catch (error) {
    return next(error)
  }
}

/** @deprecated use subscribe */
export function searchUser(req, res, next) {
  const { q = '', skip = 0, limit = 10 } = req.query
  const regexp = new RegExp(q, 'i')
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

/** @deprecated use Subscribe */
export const getUserName: RequestHandler = async (req, res, next) => {
  try {
    const { _id } = req.query
    if (!mongoose.isValidObjectId(_id))
      throw 'Query "_id" need to be a valid ObjectId'
    const user = await UserModel.findOne({ _id }, 'name').exec()
    res.json(user)
  } catch (error) {
    next(error)
  }
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
