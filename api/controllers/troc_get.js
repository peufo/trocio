let Troc = require('../models/troc')
let Article = require('../models/article')
let Payment = require('../models/payment')
let Subscribe = require('../models/subscribe')
let { findSpec, lookupIfAdmin } = require('./troc_utils')
const { ObjectId } = require('mongoose').Types

/**
 * Retourne les spécifications d'un utilisateur sur un troc (tarif, prefix, role)
 */
function getSpec(req, res, next) {
  let { troc, user } = req.query
  findSpec(troc, user, (err, spec) => {
    if (err) return next(err)
    res.json(spec)
  })
}

async function getResum(req, res, next) {
  let { troc, user, cashier } = req.query
  if (!troc) return next(Error('Troc query is required'))
  if (!req.session.user) return next(Error('Login is required'))

  // Utilisateur connecté
  if (!user) user = req.session.user._id
  if (user === 'undefined') user = { $exists: false }

  try {
    // TODO : Adapter la requete pour les client anonymes + pour des groupe
    if (user === 'undefined') {
      // client anonyme
      let purchasesPromise = Article.countDocuments({
        troc,
        sold: { $exists: true },
        buyer: { $exists: false },
        seller: req.session.user._id,
      }).exec()
      let paymentsPromise = Payment.countDocuments({
        troc,
        user: { $exists: false },
        acceptor: req.session.user._id,
      }).exec()

      let [purchasesCount, paymentsCount] = await Promise.all([
        purchasesPromise,
        paymentsPromise,
      ])

      //Compute sum
      let buySum = purchases.length
        ? -purchases.map((a) => a.price).reduce((acc, cur) => acc + cur)
        : 0
      let paySum = payments.length
        ? payments.map((a) => a.amount).reduce((acc, cur) => acc + cur)
        : 0
      let balance = Math.round((buySum + paySum) * 100) / 100

      res.json({
        troc,
        purchasesCount,
        paymentsCount,
        tarif,
        buySum,
        paySum,
        balance,
      })
    } else {
      const providedResumPromise = Article.aggregate()
        .match({ troc: ObjectId(troc), provider: ObjectId(user) })
        .project({
          price: true,
          feeValided: {
            valided: { $ifNull: ['$fee', 0] },
          },
          priceSold: {
            sold: { $ifNull: ['$price', 0] },
          },
          marginSold: {
            sold: { $ifNull: ['$margin', 0] },
          },
        })
        .group({
          _id: null,
          providedCount: { $sum: 1 },
          providedSum: { $sum: '$price' },
          feeSum: { $sum: '$feeValided' },
          soldSum: { $sum: '$priceSold' },
          marginSum: { $sum: '$marginSold' },
        })
        .exec()

      const purchasesResumPromise = Article.aggregate()
        .match({
          troc,
          buyer: user,
        })
        .group({
          _id: null,
          purchasesCount: { $sum: 1 },
          purchasesSum: { $sum: '$price' },
        })
        .exec()

      const paymentsResumPromise = Payment.aggregate()
        .match({ troc: ObjectId(troc), user: ObjectId(user) })
        .group({
          _id: null,
          paymentsCount: { $sum: 1 },
          paymentsSum: { $sum: '$amount' },
        })
        .exec()

      const [providedResum, purchasesResum, paymentsResum] = await Promise.all([
        providedResumPromise,
        purchasesResumPromise,
        paymentsResumPromise,
      ])

      /**
       * Récupère les valeurs ou attribut par défault
       */
      const {
        providedCount = 0,
        providedSum = 0,
        feeSum = 0,
        soldSum = 0,
        marginSum = 0,
      } = providedResum[0] || {}
      const { purchasesCount = 0, purchasesSum = 0 } = purchasesResum[0] || {}
      const { paymentsCount = 0, paymentsSum = 0 } = paymentsResum[0] || {}

      const balance =
        Math.round(
          (paymentsSum + soldSum - purchasesSum - feeSum - marginSum) * 100
        ) / 100

      res.json({
        troc,
        user,
        balance,
        providedCount,
        providedSum,
        feeSum,
        soldSum,
        marginSum,
        purchasesCount,
        purchasesSum,
        paymentsCount,
        paymentsSum,
      })
    }
  } catch (error) {
    next(error)
  }
}

function getStats(req, res, next) {
  Troc.findOne({ _id: req.params.id }).exec((err, troc) => {
    if (err || !troc) return next(err || Error('Troc not found'))

    let query = { troc: troc._id }
    let user = req.query.user

    if (req.query.view == 'traders') {
      user = { $in: troc.trader.map((t) => t.user) }
    } else if (req.query.view == 'privates') {
      user = { $nin: troc.trader.map((t) => t.user) }
    }

    if (req.query.view != 'global' || user) {
      query.provider = user
    }

    Article.find(query)
      .sort({ createdAt: 1 })
      .lean()
      .exec((err, articlesProposed) => {
        if (err) return next(err)

        delete query.provider
        if (user) query.buyer = user
        query.sold = { $exists: true }
        Article.find(query)
          .sort({ createdAt: 1 })
          .lean()
          .exec((err, articlesBuyed) => {
            if (err) return next(err)

            delete query.buyer
            delete query.sold
            if (user) query.user = user
            Payment.find(query)
              .sort({ createdAt: 1 })
              .lean()
              .exec((err, payments) => {
                if (err) return next(err)
                res.json({ articlesProposed, articlesBuyed, payments })
              })
          })
      })
  })
}

function search(req, res, next) {
  let {
    _id,
    search,
    skip = 0,
    limit = 20,
    start,
    end,
    north,
    east,
    sud,
    west,
  } = req.query

  let query = {}

  if (_id) query = { _id }
  else {
    query = { is_try: false }

    if (search && search.length) {
      let regexp = new RegExp(search, 'i')
      query.$or = []
      query.$or.push({ name: regexp })
      query.$or.push({ description: regexp })
      query.$or.push({ address: regexp })
      query.$or.push({ society: regexp })
    }

    if (start || end || north || east || sud || west) query.$and = []

    if (start) query.$and.push({ 'schedule.close': { $gte: start } })
    if (end) query.$and.push({ 'schedule.open': { $lte: end } })
    if (!isNaN(north)) query.$and.push({ 'location.lat': { $lt: north } })
    if (!isNaN(east)) query.$and.push({ 'location.lng': { $lt: east } })
    if (!isNaN(sud)) query.$and.push({ 'location.lat': { $gt: sud } })
    if (!isNaN(west)) query.$and.push({ 'location.lng': { $gt: west } })
  }

  Troc.find(query)
    .skip(Number(skip))
    .limit(Number(limit))
    .lean({ virtuals: true })
    .exec((err, trocs) => {
      if (err) return next(err)

      // Admin and cashier becomes booleans + add subscribed boolean
      if (req.session.user) {
        Subscribe.find({
          user: req.session.user._id,
          troc: { $in: trocs.map((t) => t._id) },
        }).exec((err, subs) => {
          if (err) return next(err)
          subs = subs.map((s) => s.troc.toString())
          trocs.forEach((troc) => {
            troc.isSubscribed = subs.includes(troc._id.toString())
            troc.isAdmin =
              troc.admin
                .map((a) => a.toString())
                .indexOf(req.session.user._id.toString()) != -1
            troc.isCashier =
              troc.cashier
                .map((c) => c.toString())
                .indexOf(req.session.user._id.toString()) != -1
          })
          res.json(trocs)
        })
      } else {
        trocs.forEach((troc) => {
          delete troc.admin
          delete troc.cashier
        })
        res.json(trocs)
      }
    })
}

function getTroc(req, res, next) {
  if (req.session.user) {
    Troc.findOne({ _id: req.params.id })
      .lean({ virtuals: true })
      .exec((err, troc) => {
        if (err || !troc) return next(err || Error('Not found'))
        lookupIfAdmin(troc, req.session.user._id.toString(), (err, troc) => {
          if (err || !troc) return next(err || Error('Not found'))
          Subscribe.findOne(
            { user: req.session.user._id, troc: troc._id },
            (err, subscribe) => {
              if (err) return next(err)
              troc.isSubscribed = !!subscribe
              res.json(troc)
            }
          )
        })
      })
  } else {
    Troc.findOne({ _id: req.params.id })
      .lean({ virtuals: true })
      .exec((err, troc) => {
        if (err || !troc) return next(err || Error('Not found'))
        delete troc.admin
        delete troc.cashier
        res.json(troc)
      })
  }
}

module.exports = {
  getSpec,
  getResum,
  getStats,
  search,
  getTroc,
}
