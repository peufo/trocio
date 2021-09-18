import config from '../../config'
import Troc from '../models/troc'
import User from '../models/user'
import Subscribe from '../models/subscribe'
import {
  lookupIfAdmin,
  populateTrocUser,
  scheduleValidation,
} from '../controllers/troc_utils'
import { RequestHandler } from 'express'

export function createTroc(req, res, next) {
  if (!req.session.user) return next(Error('Login required'))

  // TODO: Remplacer par un avertissement coté client
  // let err = scheduleValidation(req.body)
  // if (err) return next(err)

  let troc = new Troc(req.body)
  troc.creator = req.session.user._id
  troc.admin = [req.session.user._id]
  troc.tarif = [
    {
      name: 'Standard',
      bydefault: true,
      margin: 0,
      fee: [{ price: 0, value: 0 }],
      maxarticles: 100,
    },
  ]

  let subscribe = new Subscribe({ user: req.session.user._id, troc: troc._id })

  User.findOne({ _id: req.session.user._id }, (err, user) => {
    if (err || !user) return next(err || Error('User not found !'))
    if (!troc.is_try) {
      if (user.creditTroc <= -config.TROCIO_OPTION_FREE_TROC)
        return next(Error('No credit'))
      user.creditTroc--
    }
    Promise.all([troc.save(), user.save(), subscribe.save()])
      .then(() => {
        populateTrocUser(troc._id)
          .then((populatedTroc) => res.json(populatedTroc))
          .catch(next)
      })
      .catch(next)
  })
}

// TODO: n'utlisé le patch que pour les infos de base.
// Le reste est fait sur des endpoints plus précis

export function patchTroc(req, res, next) {
  const { trocId } = req.params

  Troc.findOne({ _id: trocId }).exec((err, troc) => {
    if (err || !troc) return next(err || Error('Not found'))

    console.log(troc.schedule)

    //Verifie si l'horaire est modifier
    if (
      req.body.schedule &&
      JSON.stringify(req.body.schedule) !== JSON.stringify(troc.schedule)
    ) {
      // TODO:remplacer par un avertissement coté client
      // if (new Date(troc.schedule[0]?.open).getTime() < new Date().getTime())
      //  return next(Error(`You cannot edit shedule of troc after he's started`))
      // err = scheduleValidation(req.body)
      // if (err) return next(err)
    }

    if (req.body._id) delete req.body._id
    if (req.body.__v) delete req.body.__v
    for (const p in req.body) {
      troc[p] = req.body[p]
    }
    troc.save((err) => {
      if (err) return next(err)

      lookupIfAdmin(troc, req.session.user._id.toString(), (err, troc) => {
        if (err || !troc) return next(err || Error('Not found'))
        res.json(troc)
      })
    })
  })
}

export function addAdmin(req, res, next) {
  const { trocId, userId } = req.params

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      // Check if user is already admin
      if (troc.admin.includes(userId))
        return next(Error('User is already admin'))

      // Removed of cashiers
      const cashierIndex = troc.cashier.indexOf(userId)
      if (cashierIndex !== -1) troc.cashier.splice(cashierIndex, 1)

      // Add Admin
      troc.admin.push(userId)

      troc.save(next)
    })
  })
}

export function addCashier(req, res, next) {
  const { trocId, userId } = req.params

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      //Check if user is already cashier
      if (troc.cashier.includes(userId))
        return next(Error('User is already cashier'))

      //Removed of administrators
      const adminIndex = troc.admin.indexOf(userId)
      if (adminIndex !== -1) {
        if (req.session.user._id == userId)
          return next(Error(`You can't become a cashier`))
        if (troc.creator == userId)
          return next(Error(`The creator can't become a cashier`))
        troc.admin.splice(adminIndex, 1)
      }

      troc.cashier.push(userId)
      troc.save(next)
    })
  })
}

export function addTrader(req, res, next) {
  const { trocId, userId } = req.params

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      if (!troc.trader) troc.trader = []
      troc.trader.push({
        user: userId,
        prefix: req.body.prefix || findNewPrefix(troc.trader),
      })
      troc.save(next)
    })
  })

  function findNewPrefix(traders) {
    let prefixs = traders.map((t) => t.prefix)
    let char = ''
    for (let i = 65; i < 91; i++) {
      char = String.fromCharCode(i)
      if (prefixs.indexOf(char) == -1) break
    }
    return char
  }
}

export function removeAdmin(req, res, next) {
  const { trocId, userId } = req.params

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      const adminIndex = troc.admin.indexOf(userId)
      if (adminIndex == -1) return next(Error(`Admin ${userId} not found`))

      if (troc.creator == userId) return next(Error(`Can't remove the creator`))
      if (req.session.user._id == userId)
        return next(Error(`Can't remove yourself`))

      troc.admin.splice(adminIndex, 1)

      troc.save(next)
    })
  })
}

export function removeCashier(req, res, next) {
  const { trocId, userId } = req.params

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      const cashierIndex = troc.cashier.indexOf(userId)
      if (cashierIndex == -1) return next(Error(`Cashier ${userId} not found`))

      troc.cashier.splice(cashierIndex, 1)

      troc.save(next)
    })
  })
}

export function removeTrader(req, res, next) {
  const { trocId, userId } = req.params

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      const traderIndex = troc.trader.map((c) => c.user).indexOf(userId)
      if (traderIndex == -1) return next(Error(`Trader ${userId} not found`))

      troc.trader.splice(traderIndex, 1)

      troc.save(next)
    })
  })
}

export function editTraderPrefix(req, res, next) {
  const { trocId, userId } = req.params

  User.findById(userId, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(trocId, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      if (troc.trader.map((t) => t.prefix).indexOf(req.body.prefix) != -1)
        return next(Error(`Prefix ${req.body.prefix} is already used`))

      const traderIndex = troc.trader.map((c) => c.user).indexOf(userId)
      if (traderIndex == -1) return next(Error(`Trader ${userId} not found`))

      troc.trader[traderIndex].prefix = req.body.prefix

      troc.save(next)
    })
  })
}

export const createTarif: RequestHandler = (req, res, next) => {
  const { trocId } = req.params
  const newTarif = req.body
  Troc.updateOne({ _id: trocId }, { $push: { tarif: newTarif } })
    .then(() => next())
    .catch(next)
}

export const deleteTarif: RequestHandler = (req, res, next) => {
  const { trocId, tarifId } = req.params
  Troc.updateOne(
    { _id: trocId },
    {
      $pull: { tarif: { _id: tarifId, bydefault: false } },
    }
  )
    .then((res) => next())
    .catch(next)
}

export const editTarif: RequestHandler = (req, res, next) => {
  const { trocId, tarifId } = req.params
  const { name, margin, maxarticles, fee } = req.body
  Troc.findById(trocId, (err, troc) => {
    if (err || !troc) return next(err || Error('Troc not found'))
    troc.tarif.id(tarifId).name = name
    troc.tarif.id(tarifId).margin = margin
    troc.tarif.id(tarifId).maxarticles = maxarticles
    troc.tarif.id(tarifId).fee = fee
    troc.vali
    troc.save(next)
  })
}

export const addApply: RequestHandler = (req, res, next) => {
  const { trocId, tarifId, userId } = req.params
  Troc.findById(trocId, (err, troc) => {
    if (err || !troc) return next(err || Error('Troc not found'))
    // Supprime les autres attribution
    troc.tarif.forEach((tarif) => {
      tarif.apply.pull(userId)
    })
    troc.tarif.id(tarifId).apply.push(userId)
    troc.save(next)
  })
}

export const removeApply: RequestHandler = (req, res, next) => {
  const { trocId, tarifId, userId } = req.params
  Troc.findById(trocId, (err, troc) => {
    if (err || !troc) return next(err || Error('Troc not found'))
    troc.tarif.id(tarifId).apply.pull(userId)
    troc.save(next)
  })
}
