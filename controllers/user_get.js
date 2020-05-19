let User = require('../models/user')

function getMe(req, res, next) {
    if (!req.session.user) return res.json({success: false, message: 'Login required'})
		
    User.findOne({_id: req.session.user._id}, {name: 1, mail: 1, mailvalided: 1, trocs: 1, creditTroc: 1})
    .populate('trocs', 'name description address location admin cashier schedule society societyweb')
    .lean() // <== lean() Pour pouvoir retravailler le resultat
    .exec((err, user) => {
        if (err || !user) return next(err || Error('User not found !'))

        //Admin and cashier becomes booleans
        user.trocs.forEach(troc => {
            troc.isAdmin = troc.admin.map(a => a.toString()).indexOf(user._id.toString()) != -1
            troc.isCashier = troc.cashier.map(c => c.toString()).indexOf(user._id.toString()) != -1
            if (!troc.isAdmin && !troc.isCashier) troc.admin = troc.cashier = undefined
        })

        res.json(user)
    })
}

function searchUser(req, res, next) {
    var regexp = new RegExp(req.params.search, 'i')
    User.find({$or: [{name: regexp}, {mail: regexp}]}, {name: 1, mail: 1})
        .limit(10)
        .lean()
        .exec((err, users) => {
        if (err) return next(err)

        users.forEach(hideMail)

        res.json(users)
    })
}

function getUser(req, res, next) {
    User.findById(req.params.id).lean().exec((err, user) => {
        if (err) return next(err)
        hideMail(user)
        res.json(user)
    })
}

function hideMail(user) {
	let index = user.mail.indexOf('@')
	if (index > -1) {
		user.mail = user.mail.replace(user.mail.slice(2, index - 1), '*'.repeat(index - 3))
	}else {
		user.mail = 'Invalid mail'
	}
}

module.exports = {
    getMe, 
    searchUser,
    getUser
}