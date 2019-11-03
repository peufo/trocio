var User = require('../models/user')
var Mailvalidator = require('../models/mailvalidator')
var mail = require('./mail')
var randomize = require('randomatic')
var {TROCIO_ADMIN} = require('../config')

module.exports = {

	checkLogin: (req, res, next) => {
		if (!req.session.user) return next(Error('Login required'))
		next()
	},

	checkSuperAdmin: (req, res, next) => {
		if (!req.session.user) return next(Error('Login required'))
		if (!TROCIO_ADMIN) return next(Error('The environment variable TROCIO_ADMIN is undefined'))
		if (TROCIO_ADMIN != req.session.user.mail) return next(Error('Access denied'))
		next()
	},

	createUser: (req, res, next) => {
		req.body.creditTroc = 0
		var user = new User(req.body)
		user.save(err => {
			if (err) {
				if ( err.name == 'MongoError' && err.code == 11000) { //dup key
					err.name = 'Error'
					err.message = 'Le mail indiqué est déjà utilisé !'
				}else if ( err.name == 'ValidationError') {
					err.name = 'Error'
					err.message = `Renseignement invalide`
				}
				return next(err)
			}

			mail.createUser(user, err => {
				if (err) return next(err)
				res.status(201).json({success: true, message: 'Inscritpion réussie!'})
			})

		})
	},

	login: (req, res, next) => {


		if (!req.body.mail || !req.body.password) {
			return next(Error('Renseignement manquant !'))
		}else{
			User.getAuthenticated(req.body.mail, req.body.password, (err, user, reason) => {
				if (!err) {
					if (user) {
						console.log(`Nouvelle connection de ${user.name}`)
						req.session.user = user
						//La redirection se fait côté client
						res.redirect('/users/me')
					}else{
						var reasons = User.failedLogin
						switch(reason){
							case reasons.NOT_FOUND:
								next(Error('Le mail indiqué n\'est pas associé à un compte!'))
								break
							case reasons.PASSWORD_INCORRECT:
								next(Error('Mot de passe invalide!'))
								break
							case reasons.MAX_ATTEMPTS:
								next(Error('Ce compte est temporairement verrouillé!'))
								break
							default:
								next(Error('Erreur, raison inconnue!'))
						}
					}
				}else next(err)
			})			
		}
	},

	logout: (req, res, next) => {
		req.session.user = undefined
		res.redirect('/')
	},

	changepwd: (req, res, next) => {
		let user = req.session.user
		let oldPassword = req.body.oldPassword
		let newPassword = req.body.newPassword
		if (!user) return next()
		User.getAuthenticated(user.mail, oldPassword, (err, user, reason) => {
			if (err) return next()
			user.password = newPassword
			user.save(err => {
				if (err) return next()
				res.json({success: true, message: 'Password changed !'})
			})
		})
	},

	resetpwd: (req, res, next) => {
		User.findOne({mail: req.body.mail}, (err, user) => {
			if (err) return next(err)
			var unchiffredPwd = randomize('Aa0', 10)
			user.password = unchiffredPwd
			user.save(err => {
				if (err) return next(err)
				mail.resetpwd(user, unchiffredPwd, err => {
					if (err) return next(err)
					res.json({success: true, message: 'Password reseted, check your mail box !'})
				})
			})
		})
	},

	sendValidMail:(req, res, next) => {
		if (!req.session.user) return next(Error('Login required'))
		mail.sendValidMail(req.session.user, err => {
			if (err) return next(err)
			res.json({success: true, message: `Mail sent for validation on address ${req.session.user.mail}`})
		})
	},

	validMail:(req, res, next) => {

		Mailvalidator.findOne({user: req.params.id, url: req.params.url}, (err, mv) => {
			if (err || !mv) return next(err || Error(`MailValidator not exist`))
			
			User.findOne({_id: req.params.id}, (err, user) => {
				if (err || !user) return next(err || Error('You are not found !'))
				user.mailvalided = true
				user.save(err => {
					if (err) return next(err)
					mv.remove(err => {
						if (err) return next(err)
						if (req.session.user) res.redirect('/me')
						else res.redirect('/mailConfirmation')
					})					
				})
			})
		})
	}
}


