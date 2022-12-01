import { Router } from 'express'
import mongoose from 'mongoose'

import config from '../../config'
import User from '../models/user'
import Troc from '../models/troc'
import Article from '../models/article'
import Payment from '../models/payment'
import Subscribe from '../models/subscribe'
import { getOptions, setOption } from '../controllers/option'
import { cleanUpArticlesMargin } from '../controllers/root'
import { dynamicQuery } from '../controllers/utils'

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
      const { limit = 20, skip = 0 } = req.query
      let { match, sort } = dynamicQuery(req.query)

      const aggregate = User.aggregate()
        .lookup({
          from: 'trocs',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$$userId', '$creator'] },
              },
            },
            {
              $group: {
                _id: null,
                count: {
                  $sum: { $cond: [{ $eq: ['$is_try', false] }, 1, 0] },
                },
                countTry: {
                  $sum: { $cond: [{ $eq: ['$is_try', true] }, 1, 0] },
                },
              },
            },
          ],
          as: 'trocs',
        })
        .addFields({
          trocs: { $arrayElemAt: ['$trocs', 0] },
        })
        .match(match)

      if (Object.keys(sort).length) aggregate.sort(sort)
      aggregate.skip(+skip).limit(+limit)
      const users = await aggregate.exec()
      res.json(users)
    } catch (error) {
      next(error)
    }
  })
  .get('/trocs', async (req, res, next) => {
    const { limit = 20, skip = 0 } = req.query
    let { match, sort } = dynamicQuery(req.query)
    const aggregate = Troc.aggregate()
      .match(match)
      .lookup({
        from: 'users',
        localField: 'creator',
        foreignField: '_id',
        as: 'creator',
      })
      .addFields({
        creator: { $arrayElemAt: ['$creator', 0] },
      })

    if (Object.keys(sort).length) aggregate.sort(sort)
    aggregate.skip(+skip).limit(+limit)

    const trocs = await aggregate.exec()
    res.json(trocs)
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
