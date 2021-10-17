import config from '../../config'
import { Router } from 'express'
import User from '../models/user'
import Troc from '../models/troc'
import Article from '../models/article'
import Payment from '../models/payment'
import Subscribe from '../models/subscribe'
import type { Document } from 'mongoose'
import type { ISubscribe as SubscribeInterface } from '../../types'

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
  .post('/remove-troc', async (req, res, next) => {
    const { trocId } = req.body
    if (!trocId) return next(Error('trocId field is required in body'))
    try {
      const troc = await Troc.findById(trocId).exec()
      if (!troc) throw 'Troc not found'

      let { deletedCount: deletedSubscribes } = await Subscribe.deleteMany({
        trocId: troc._id,
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
        trocId: troc._id,
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
     * - Récupère les liste admin, trader, cashier, et provider pour créer des subscribes
     * - Ajoute le validedByUser à vrai
     * - Ajoute le tarif appliqué dans l'abonnement
     * - Transforme user et troc en userId et trocId
     */
    const { trocId } = req.body
    if (!trocId) return next(Error('trocId field is required in body'))
    try {
      const troc = await Troc.findById(trocId).exec()
      if (!troc) throw 'Troc not found'

      const defaultTarifId = troc.tarif.find((tarif) => tarif.bydefault)._id

      /** ADMIN */
      await Promise.all(
        troc.admin.map(async (userId) => {
          const sub = await Subscribe.findOne({
            troc: troc._id,
            user: userId,
          }).exec()
          return updateOrCreateSub(sub, 'admin', userId)
        })
      )

      /** CASHIER */
      await Promise.all(
        troc.cashier.map(async (userId) => {
          const sub = await Subscribe.findOne({
            troc: troc._id,
            user: userId,
          }).exec()
          return updateOrCreateSub(sub, 'cashier', userId)
        })
      )

      /** PROVIDER */
      await Promise.all(
        troc.provider.map(async (userId) => {
          const sub = await Subscribe.findOne({
            troc: troc._id,
            user: userId,
          }).exec()
          return updateOrCreateSub(sub, 'basic', userId)
        })
      )

      /** TRADER */
      await Promise.all(
        troc.trader.map(async (trader) => {
          const sub = await Subscribe.findOne({
            troc: troc._id,
            user: trader.user,
          }).exec()
          return updateOrCreateSub(sub, 'basic', trader.user, trader.prefix)
        })
      )

      function updateOrCreateSub(
        sub: SubscribeInterface & Document,
        role: SubscribeInterface['role'],
        userId: string,
        prefix?: string
      ): Promise<any> {
        const newSub = {
          userId,
          trocId: troc._id,
          role,
          prefix,
          validedByUser: true,
          tarifId:
            troc.tarif.find((tarif) => tarif.apply?.includes(sub.userId))
              ?._id || defaultTarifId,
        }

        if (sub) {
          for (const key in newSub) {
            sub[key] = newSub[key]
          }
          sub.troc = undefined
          sub.user = undefined
        } else {
          sub = new Subscribe(newSub)
        }
        return sub.save()
      }

      // @ts-ignore
      const subs = await Subscribe.find({
        troc: trocId,
        role: { $exists: 0 },
      }).exec()

      await Promise.all(
        subs.map((sub) => {
          sub.role = 'basic'
          sub.userId = sub.user
          sub.trocId = sub.troc
          sub.user = undefined
          sub.troc = undefined
          sub.tarifId =
            troc.tarif.find((tarif) => tarif.apply?.includes(sub.userId))
              ?._id || defaultTarifId
          return sub.save()
        })
      )

      /** Supprime les champs dérpecier de troc */

      troc.admin = undefined
      troc.cashier = undefined
      troc.trader = undefined
      troc.provider = undefined
      troc.tarif.forEach((tarif) => (tarif.apply = undefined))

      await troc.save()

      res.json({
        success: true,
        message: `subscribes updated (${subs.length} without role)`,
      })
    } catch (error) {
      next(error)
    }
  })

export default router
