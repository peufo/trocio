import config from '../../config'
const router = require('express').Router()
import User from '../models/user'
import Troc from '../models/troc'
import Article from '../models/article'
import Payment from '../models/payment'
import Subscribe from '../models/subscribe'

router
  .get('/', (req, res, next) => {
    res.json({ success: true, message: 'Yo root user' })
  })
  .get('/options', (req, res, next) => {
    let options = []
    for (const key in config) {
      if (key.indexOf('TROCIO_OPTION_') === 0) {
        options.push({
          name: key.replace('TROCIO_OPTIONS_', ''),
          value: config[key],
        })
      }
    }
    res.json(options)
  })
  .post('/addcredit', (req, res, next) => {
    let { user } = req.body
    User.findOne({ _id: user }, { mail: 1, creditTroc: 1 }, (err, user) => {
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
  .get('/users', (req, res, next) => {
    User.find(req.query, (err, users) => {
      if (err) return next(err)
      res.json(users)
    })
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
    User.find(req.query, { mail: 1 }, (err, users) => {
      if (err) return next(err)
      let str = users.map((user) => user.mail).join('<br>')
      res.send(str)
    })
  })
  .get('/subscribes', (req, res, next) => {
    Subscribe.find(req.query, (err, subscribes) => {
      if (err) return next(err)
      res.json(subscribes)
    })
  })
  .post('/subscribe-all-users', async (req, res, next) => {
    let { troc } = req.body
    if (!troc) return next(Error('troc query is required'))
    try {
      troc = await Troc.findById(troc).exec()
      if (!troc) throw 'Troc not found'
      let users = await User.find().exec()
      let nbNewSubscribe = 0
      let subscribes = await Promise.all(
        users.map(async (user) => {
          let sub = await Subscribe.findOne({
            troc: troc._id,
            user: user._id,
          }).exec()
          if (sub) return Promise.resolve()
          nbNewSubscribe++
          return new Subscribe({
            troc: troc._id,
            user: user._id,
          }).save()
        })
      )

      res.json({
        success: true,
        message: `${nbNewSubscribe} new users are subscribed to ${troc.name}`,
      })
    } catch (error) {
      next(error)
    }
  })
  .post('/remove-troc', async (req, res, next) => {
    let { troc } = req.body
    if (!troc) return next(Error('troc query is required'))
    try {
      troc = await Troc.findById(troc).exec()
      if (!troc) throw 'Troc not found'

      let { deletedCount: deletedSubscribes } = await Subscribe.deleteMany({
        troc: troc._id,
      }).exec()

      let { deletedCount: deletedArticles } = await Article.deleteMany({
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
  .post('/compute-subscriber', async (req, res, next) => {
    let { troc } = req.body
    if (!troc) return next(Error('troc query is required'))
    try {
      troc = await Troc.findById(troc).exec()
      if (!troc) throw 'Troc not found'

      troc.subscriber = await Subscribe.countDocuments({
        troc: troc._id,
      }).exec()

      await troc.save()

      res.json({
        success: true,
        message: `This troc have ${troc.subscriber} subscribes`,
      })
    } catch (error) {
      next(error)
    }
  })
  .post('/compute-articles', async (req, res, next) => {
    let { troc } = req.body
    if (!troc) return next(Error('troc query is required'))
    try {
      troc = await Troc.findById(troc).exec()
      if (!troc) throw 'Troc not found'

      troc.articles = await Article.countDocuments({ troc: troc._id }).exec()

      await troc.save()

      res.json({
        success: true,
        message: `This troc have ${troc.articles} articles`,
      })
    } catch (error) {
      next(error)
    }
  })

export default router
