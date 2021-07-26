import { TROCIO_OPTION_FREE_TROC } from '../../config.js'
import Troc from '../models/troc'
import User from '../models/user'
import Subscribe from '../models/subscribe'
import {
  lookupIfAdmin,
  populateTrocUser,
  scheduleValidation,
} from '../controllers/troc_utils'

export function createTroc(req, res, next) {
  if (!req.session.user) return next(Error('Login required'))

  let err = scheduleValidation(req.body)
  if (err) return next(err)

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
      if (user.creditTroc <= -TROCIO_OPTION_FREE_TROC)
        return next(Error('No credit'))
      user.creditTroc--
    }
    Promise.all([troc.save(), user.save(), subscribe.save()])
      .then(() => {
        populateTrocUser(troc._id, (err, troc) => {
          if (err) return next(err)
          res.json(troc)
        })
      })
      .catch(next)
  })
}

export function patchTroc(req, res, next) {
  Troc.findOne({ _id: req.params.id }).exec((err, troc) => {
    if (err || !troc) return next(err || Error('Not found'))

    //Verifie si l'horaire est modifier
    if (
      req.body.schedule &&
      JSON.stringify(req.body.schedule) !== JSON.stringify(troc.schedule)
    ) {
      if (new Date(troc.schedule[0]?.open).getTime() < new Date().getTime())
        return next(Error(`You cannot edit shedule of troc after he's started`))
      err = scheduleValidation(req.body)
      if (err) return next(err)
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
  User.findById(req.body.admin, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(req.params.id, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      // Check if user is already admin
      if (troc.admin.includes(req.body.admin))
        return next(Error('User is already admin'))

      // Removed of cashiers
      const cashierIndex = troc.cashier.indexOf(req.body.admin)
      if (cashierIndex !== -1) troc.cashier.splice(cashierIndex, 1)

      // Add Admin
      troc.admin.push(req.body.admin)

      troc.save((err) => {
        if (err) return next(err)
        resTrocUser(req, res, next)
      })
    })
  })
}

export function addCashier(req, res, next) {
  User.findById(req.body.cashier, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(req.params.id, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      //Check if user is already cashier
      if (troc.cashier.includes(req.body.cashier))
        return next(Error('User is already cashier'))

      //Removed of administrators
      const adminIndex = troc.admin.indexOf(req.body.cashier)
      if (adminIndex !== -1) {
        if (req.session.user._id == req.body.cashier)
          return next(Error(`You can't become a cashier`))
        if (troc.creator == req.body.cashier)
          return next(Error(`The creator can't become a cashier`))
        troc.admin.splice(adminIndex, 1)
      }

      troc.cashier.push(req.body.cashier)
      troc.save((err) => {
        if (err) return next(err)
        resTrocUser(req, res, next)
      })
    })
  })
}

export function addTrader(req, res, next) {
  User.findById(req.body.trader, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(req.params.id, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      if (!troc.trader) troc.trader = []
      troc.trader.push({
        user: req.body.trader,
        prefix: req.body.prefix || findNewPrefix(troc.trader),
      })
      troc.save((err) => {
        if (err) return next(err)
        resTrocUser(req, res, next)
      })
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
  User.findById(req.body.admin, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(req.params.id, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      const adminIndex = troc.admin.indexOf(req.body.admin)
      if (adminIndex == -1)
        return next(Error(`Admin ${req.body.admin} not found`))

      if (troc.creator == req.body.admin)
        return next(Error(`Can't remove the creator`))
      if (req.session.user._id == req.body.admin)
        return next(Error(`Can't remove yourself`))

      troc.admin.splice(adminIndex, 1)

      troc.save((err) => {
        if (err) return next(err)
        resTrocUser(req, res, next)
      })
    })
  })
}

export function removeCashier(req, res, next) {
  User.findById(req.body.cashier, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(req.params.id, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      const cashierIndex = troc.cashier.indexOf(req.body.cashier)
      if (cashierIndex == -1)
        return next(Error(`Cashier ${req.body.cashier} not found`))

      troc.cashier.splice(cashierIndex, 1)

      troc.save((err) => {
        if (err) return next(err)
        resTrocUser(req, res, next)
      })
    })
  })
}

export function removeTrader(req, res, next) {
  User.findById(req.body.trader, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(req.params.id, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      const traderIndex = troc.trader
        .map((c) => c.user)
        .indexOf(req.body.trader)
      if (traderIndex == -1)
        return next(Error(`Trader ${req.body.trader} not found`))

      troc.trader.splice(traderIndex, 1)

      troc.save((err) => {
        if (err) return next(err)
        resTrocUser(req, res, next)
      })
    })
  })
}

export function editTraderPrefix(req, res, next) {
  User.findById(req.body.trader, (err, user) => {
    if (err || !user) return next(err || Error('User not found'))

    Troc.findById(req.params.id, (err, troc) => {
      if (err || !troc) return next(err || Error('Troc not found'))

      if (troc.trader.map((t) => t.prefix).indexOf(req.body.prefix) != -1)
        return next(Error(`Prefix ${req.body.prefix} is already used`))

      const traderIndex = troc.trader
        .map((c) => c.user)
        .indexOf(req.body.trader)
      if (traderIndex == -1)
        return next(Error(`Trader ${req.body.trader} not found`))

      troc.trader[traderIndex].prefix = req.body.prefix

      troc.save((err) => {
        if (err) return next(err)
        resTrocUser(req, res, next)
      })
    })
  })
}

export function resTrocUser(req, res, next) {
  populateTrocUser(req.params.id, (err, troc) => {
    if (err) return next(err)
    res.json(troc)
  })
}

export default {
  createTroc,
  patchTroc,
  addAdmin,
  addCashier,
  addTrader,
  removeAdmin,
  removeCashier,
  removeTrader,
  editTraderPrefix,
}
