import { exec } from 'child_process'

import config from '../../config'
import Subscribe from '../models/subscribe'
import Payment from '../models/payment'
import Article from '../models/article'

const { TROCIO_DB, TROCIO_BACKUP } = config

export async function migration() {
  try {
    await backup()
    await cleanUpSubscribes()
    await migrationArticles()
    await migrationPayments()
    return
  } catch (error) {
    handleError(error)
  }
}

/**
 * Faut un dump de la DB
 */
async function backup() {
  return new Promise((resolve, reject) => {
    const TROCIO_DB_NAME = TROCIO_DB.split('/').slice(-1)

    const backupCommand = `mongodump -d ${TROCIO_DB_NAME} -o ${TROCIO_BACKUP}/${TROCIO_DB_NAME}-${new Date()
      .toISOString()
      .replace(/:|\./g, '-')}`

    exec(backupCommand, (error, stdout, stderr) => {
      if (error) reject(error)
      console.log(stdout)
      console.log(stderr)
      resolve(null)
    })
  })
}

/**
 * Supprime les subscribe en doublons
 */
async function cleanUpSubscribes() {
  try {
    // detection des doublon subscribe
    const groupSubs = await Subscribe.aggregate()
      .match({
        userId: { $exists: 1 },
      })
      .group({
        _id: { userId: '$userId', trocId: '$trocId' },
        count: { $sum: 1 },
        subs: { $push: '$$ROOT' },
      })
      .match({
        _id: { $ne: null },
        count: { $gt: 1 },
      })

    // Suppression des doublons
    for (const group of groupSubs) {
      for (let i = 1; i < group.subs.length; i++) {
        const sub = await Subscribe.findById(group.subs[i]._id)
        await sub.remove()
        console.log('Subscribe duplicates removed')
      }
    }
  } catch (error) {
    handleError(error, 'SUBSCRIBES FAILED')
  }
}

/**
 * Créer les ref vers subscribe
 * Assure que les shortcuts vers user
 */
async function migrationArticles() {
  try {
    const articles = await Article.find()

    for (const article of articles) {
      // ignore si l'article est déjà migré
      if (!article.troc) {
        console.log('Article migration ignored')
        continue
      }

      // récupère les anciens ids
      article.trocId = article.troc
      article.providerId = article.provider
      article.buyerId = article.buyer
      article.validatorId = article.validator
      article.sellerId = article.seller

      // fait les liens avec les bons subscribes
      if (article.providerId) {
        const providerSub = await Subscribe.findOne({
          userId: article.providerId,
          trocId: article.trocId,
        })
        if (!providerSub) throw 'providerSub not found'
        article.providerSubId = providerSub._id
      }
      if (article.buyerId) {
        const buyerSub = await Subscribe.findOne({
          userId: article.buyerId,
          trocId: article.trocId,
        })
        if (!buyerSub) throw 'buyerSub not found'
        article.buyerSubId = buyerSub._id
      }
      if (article.validatorId) {
        const validatorSub = await Subscribe.findOne({
          userId: article.validatorId,
          trocId: article.trocId,
        })
        if (!validatorSub) throw 'validatorSub not found'
        article.validatorSubId = validatorSub._id
      }
      if (article.sellerId) {
        const sellerSub = await Subscribe.findOne({
          userId: article.sellerId,
          trocId: article.trocId,
        })
        if (!sellerSub) throw 'sellerSub not found'
        article.sellerSubId = sellerSub._id
      }

      // Supprime les anciens liens
      article.troc = undefined
      article.provider = undefined
      article.buyer = undefined
      article.validator = undefined
      article.seller = undefined

      // Sauvegarde l'article
      await article.save()
      console.log('Article migrated')
    }
  } catch (error) {
    handleError(error, 'ARTICLES FAILED')
  }
}

/**
 * Créer les ref vers subscribe
 * Assure que les shortcuts vers user
 */
async function migrationPayments() {
  try {
    const payments = await Payment.find()

    for (const payment of payments) {
      // ignore si le payment est déjà migré
      if (!payment.troc) {
        console.log('Payment migration ignored')
        continue
      }

      // récupère les anciens ids
      payment.trocId = payment.troc
      payment.userId = payment.user
      payment.acceptorId = payment.acceptor

      // fait les liens avec les bons subscribes
      if (payment.userId) {
        const userSub = await Subscribe.findOne({
          userId: payment.userId,
          trocId: payment.trocId,
        })
        if (!userSub) throw 'userSub not found'
        payment.userSubId = userSub._id
      }
      if (payment.acceptorId) {
        const acceptorSubId = await Subscribe.findOne({
          userId: payment.acceptorId,
          trocId: payment.trocId,
        })
        if (!acceptorSubId) throw 'acceptorSubId not found'
        payment.acceptorSubId = acceptorSubId._id
      }

      // Supprime les anciens liens
      payment.troc = undefined
      payment.user = undefined
      payment.acceptor = undefined

      // Sauvegarde
      await payment.save()
      console.log('Payement migrated')
    }
  } catch (error) {
    handleError(error, 'PAYMENTS FAILED')
  }
}

function handleError(error: any, label = 'MIGRATION FAILED') {
  console.log('---------------------------------------------')
  console.log(`------------  ${label} --------------`)
  console.log('---------------------------------------------')
  console.log('')
  console.error(error)
  throw error
}
