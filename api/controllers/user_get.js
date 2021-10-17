let User = require('../models/user')

function getMe(req, res, next) {
  if (!req.session.user)
    return res.json({ error: true, message: 'Login required' })
  User.findOne(
    { _id: req.session.user._id },
    {
      name: 1,
      mail: 1,
      mailvalided: 1,
      trocs: 1,
      creditTroc: 1,
      acceptTerms: 1,
    }
  ).exec((err, user) => {
    if (err || !user) return next(err || Error('User not found !'))
    res.json(user)
  })
}

function searchUser(req, res, next) {
  const { q = '', skip = 0 } = req.query
  let regexp = new RegExp(q, 'i')
  User.find({ $or: [{ name: regexp }, { mail: regexp }] }, { name: 1, mail: 1 })
    .skip(skip)
    .limit(10)
    .lean()
    .exec((err, users) => {
      if (err) return next(err)
      users.forEach(hideMail)
      res.json(users)
    })
}

function getUser(req, res, next) {
  User.findById(req.params.id)
    .lean()
    .exec((err, user) => {
      if (err || !user) return next(err || Error('User not found'))
      delete user.password
      res.json(user)
    })
}

function getUserName(req, res, next) {
  User.findOne({ _id: req.params.id }, 'name')
    .lean()
    .exec((err, user) => {
      if (err || !user) return next(err || Error('User not found'))
      res.json(user)
    })
}

function hideMail(user) {
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

//TODO: user.trocs is removed
function populateUserTrocs(userId, cb) {
  User.findOne(
    { _id: userId },
    { name: 1, mail: 1, mailvalided: 1, trocs: 1, creditTroc: 1 }
  )
    .populate(
      'trocs',
      'name description address location admin cashier schedule society societyweb'
    )
    .lean() // <== lean() Pour pouvoir retravailler le resultat
    .exec((err, user) => {
      if (err || !user) return cb(err || Error('User not found !'))

      //Admin and cashier becomes booleans
      user.trocs.forEach((troc) => {
        troc.isAdmin =
          troc.admin.map((a) => a.toString()).indexOf(user._id.toString()) != -1
        troc.isCashier =
          troc.cashier.map((c) => c.toString()).indexOf(user._id.toString()) !=
          -1
        if (!troc.isAdmin && !troc.isCashier)
          troc.admin = troc.cashier = undefined
      })

      cb(null, user)
    })
}

module.exports = {
  getMe,
  searchUser,
  getUser,
  getUserName,
  populateUserTrocs,
}
