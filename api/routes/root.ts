import config from '../../config'
import { Router } from 'express'
import User from '../models/user'
import Troc from '../models/troc'
import Article from '../models/article'
import Payment from '../models/payment'
import Subscribe from '../models/subscribe'

const router = Router()

router
  .get('/', (req, res, next) => {
    res.json({ success: true, message: 'Yo root user' })
  })
  .get('/options', (req, res, next) => {
    const options: { name: string; value: string }[] = []
    for (const key in config) {
      if (key.match(/^TROCIO_OPTION_/)) {
        options.push({
          name: key.replace('TROCIO_OPTION_', ''),
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
    User.find(req.query, { mail: 1 }).exec((err, users) => {
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
    const { trocId } = req.body
    if (!trocId) return next(Error('trocId field is required in body'))
    try {
      const troc = await Troc.findById(trocId).exec()
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
    const { trocId } = req.body
    if (!trocId) return next(Error('trocId field is required in body'))
    try {
      const troc = await Troc.findById(trocId).exec()
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
    const { trocId } = req.body
    if (!trocId) return next(Error('trocId field is required in body'))
    try {
      const troc = await Troc.findById(trocId).exec()
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
    const { trocId } = req.body
    if (!trocId) return next(Error('trocId field is required in body'))
    try {
      const troc = await Troc.findById(trocId).exec()
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
  .post('/subscribes-migration', async (req, res, next) => {
    /**
     * - Ajoute le validedByUser à vrai
     * - Ajoute le tarif appliqué dans l'abonnement
     */
    const { trocId } = req.body
    if (!trocId) return next(Error('trocId field is required in body'))
    try {
      const troc = await Troc.findById(trocId).exec()
      const subscribes = await Subscribe.find({ troc: trocId }).exec()
      if (!troc) throw 'Troc not found'

      const defaultTarifId = troc.tarif.find((tarif) => tarif.bydefault)._id

      await Promise.all(
        subscribes.map((sub) => {
          sub.validedByUser = true
          sub.tarifId =
            troc.tarif.find((tarif) => tarif.apply.includes(sub.user))?._id ||
            defaultTarifId
          return sub.save()
        })
      )

      res.json({
        success: true,
        message: `${subscribes.length} subscribes updated`,
      })
    } catch (error) {
      next(error)
    }
  })
  .post('/user-troc-to-subscribe', async (req, res, next) => {
    /**
     * Transfert les listes des utilisateurs ayant un role sur le troc aux subscribes
     */
    const { trocId } = req.body
    if (!trocId) return next(Error('trocId field is required in body'))
    try {
      const troc = await Troc.findById(trocId).exec()
      const subscribes = await Subscribe.find({ troc: trocId }).exec()
      if (!troc) throw 'Troc not found'

      const [subAdmins, subCashiers, subTraders] = await Promise.all([
        Subscribe.find({ troc: troc._id, user: { $in: troc.admin } }).exec(),
        Subscribe.find({ troc: troc._id, user: { $in: troc.cashier } }).exec(),
        Subscribe.find({
          troc: troc._id,
          user: { $in: troc.trader.map((trader) => trader.user) },
        }).exec(),
      ])

      await Promise.all([
        subAdmins.map((sub) => {
          sub.role = 'admin'
          return sub.save()
        }),
        subCashiers.map((sub) => {
          sub.role = 'cashier'
          return sub.save()
        }),
        subTraders.map((sub) => {
          sub.role = 'trader'
          sub.prefix = troc.trader.find(
            (trader) => String(trader.user) === String(sub.user)
          )?.prefix

          return sub.save()
        }),
      ])

      // Attribut le role 'basic' à tout les subs sans role

      const subs = await Subscribe.find({
        troc: troc._id,
        role: { $exists: 0 },
      }).exec()
      await Promise.all(
        subs.map((sub) => {
          sub.role = 'basic'
          return sub.save()
        })
      )

      res.json({
        success: true,
        message: `Subscribes role updated: ${subAdmins.length} admins, ${subCashiers.length} cashiers, ${subTraders.length} traders, ${subs.length} basics`,
      })
    } catch (error) {
      next(error)
    }
  })

export default router
