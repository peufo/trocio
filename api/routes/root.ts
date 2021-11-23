import { Router } from 'express'
import mongoose from 'mongoose'

import config from '../../config'
import User from '../models/user'
import Troc from '../models/troc'
import Article from '../models/article'
import Payment from '../models/payment'
import Subscribe from '../models/subscribe'
import { getOptions, setOption } from '../controllers/option'
import { migration, cleanUpArticlesMargin } from '../controllers/root'

const router = Router()
const { ObjectId } = mongoose.Types

router
  .get('/', (req, res, next) => {
    res.json({ success: true, message: 'Yo root user' })
  })
  .get('/options', getOptions)
  .post('/options', setOption)
  .get('/envs', (req, res, next) => {
    const options: { name: string; value: string }[] = []
    for (const key in config) {
      if (key.match(/TROCIO/)) {
        options.push({
          name: key,
          value: config[key],
        })
      }
    }
    res.json(options)
  })
  .post('/addcredit', (req, res, next) => {
    let { user } = req.body
    User.findOne({ _id: user }, { mail: 1, creditTroc: 1 }, {}, (err, user) => {
      if (err || !user) return next(err || Error('User not found'))
      if (user.creditTroc) user.creditTroc++
      else user.creditTroc = 1
      user.save((err) => {
        if (err) return next(err)
        res.json({
          message: `One credit is added for ${user.mail}\nTotal: ${user.creditTroc}`,
        })
      })
    })
  })
  .get('/users', async (req, res, next) => {
    try {
      const { limit = 100 } = req.query
      // @ts-ignore
      const users = await User.find(req.query).limit(limit)
      res.json(users)
    } catch (error) {
      next(error)
    }
  })
  .get('/trocs', (req, res, next) => {
    Troc.find(req.query, (err, trocs) => {
      if (err) return next(err)
      res.json(trocs)
    })
  })
  .get('/articles', (req, res, next) => {
    Article.find(req.query, (err, articles) => {
      if (err) return next(err)
      res.json(articles)
    })
  })
  .get('/payments', (req, res, next) => {
    Payment.find(req.query, (err, payments) => {
      if (err) return next(err)
      res.json(payments)
    })
  })
  .get('/mails', (req, res, next) => {
    User.find(req.query, { mail: 1 }).exec((err, users) => {
      if (err) return next(err)
      let str = users.map((user) => user.mail).join('<br>')
      res.send(str)
    })
  })
  .get('/subscribes', async (req, res, next) => {
    try {
      const { trocId } = req.query
      if (typeof trocId !== 'string') throw 'trocId is required'

      const subscribes = await Subscribe.aggregate()
        .match({ trocId: new ObjectId(trocId) })
        .lookup({
          from: 'users',
          let: { userId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$$userId', '$_id'],
                },
              },
            },
            {
              $project: { name: 1, mail: 1 },
            },
          ],
          as: 'user',
        })
        .addFields({
          user: { $arrayElemAt: ['$user', 0] },
        })
        .addFields({
          user_name: '$user.name',
          user_mail: '$user.mail',
        })
        .project({ user: 0 })
        .exec()

      res.json(subscribes)
    } catch (error) {
      next(error)
    }
  })
  .post('/migration', async (req, res, next) => {
    try {
      await migration()
      res.json({ success: true, message: 'The migration is done successfully' })
    } catch (error) {
      next(error)
    }
  })
  .post('/cleanUpArticlesMargin', async (req, res, next) => {
    try {
      await cleanUpArticlesMargin()
      res.json({ success: true, message: 'Articles margin cleanup' })
    } catch (error) {
      next(error)
    }
  })
  .post('/remove-troc', async (req, res, next) => {
    const { trocId } = req.body
    if (!trocId) return next(Error('trocId field is required in body'))
    try {
      const troc = await Troc.findById(trocId).exec()
      if (!troc) throw 'Troc not found'

      let { deletedCount: deletedSubscribes } = await Subscribe.deleteMany({
        trocId: troc._id,
      }).exec()

      let deletedArticles = await Article.deleteMany({
        troc: troc._id,
      })
        .remove()
        .exec()

      await Troc.deleteOne({ _id: troc._id }).exec()

      res.json({
        success: true,
        message: `
            ${troc.name} is removed,
            ${deletedSubscribes} subscribes and ${deletedArticles} articles
        `,
      })
    } catch (error) {
      next(error)
    }
  })

export default router
