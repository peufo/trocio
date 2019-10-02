var User = require('../models/user')
var Mailvalidator = require('../models/mailvalidator')
var mail = require('./mail')
var randomize = require('randomatic')

module.exports = {

	createUser: (req, res, next) => {
		var user = new User(req.body)

		user.save(err => {
			if (err) {
				if ( err.name == 'MongoError' && err.code == 11000) { //dup key
					err.name = 'userError'
					err.message = 'Le mail indiqué est déjà utilisé !'
				}else if ( err.name == 'ValidationError') {
					err.name = 'userError'
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
		let userError = new Error()
		userError.name ='userError' //userError is followed in production

		if (!req.body.mail || !req.body.password) {
			userError.message = 'Renseignement manquant !'
			return next(userError)
		}else{
			User.getAuthenticated(req.body.mail, req.body.password, (err, user, reason) => {
				if (!err) {
					if (user) {
						console.log(`Nouvelle connection de ${user.name}`)
						req.session.user = user
						//La redirection ce fait côté client
						res.redirect('/users/me')
					}else{
						var reasons = User.failedLogin
						switch(reason){
							case reasons.NOT_FOUND:
								userError.message = 'Le mail indiqué n\'est pas associé à un compte!'
								break
							case reasons.PASSWORD_INCORRECT:
								userError.message = 'Mot de passe invalide!'
								break
							case reasons.MAX_ATTEMPTS:
								userError.message = 'Ce compte est temporairement verrouillé!'
								break
							default:
								userError.message = 'Erreur, raison inconnue!'
						}
						next(userError)
					}
				}else next(err)
			})			
		}
	},

	checkLogin: (req, res, next) => {
		if (req.session.user) {
			next()
		}else{
			res.redirect('/welcome')
		}
	},

	logout: (req, res, next) => {
		req.session.user = undefined
		res.redirect('/')
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
		if (!req.session.user) return next(err)
		mail.sendValidMail(req.session.user, err => {
			if (err) return next(err)
			res.json({success: true, message: `Mail sent for validation on address ${req.session.user.mail}`})
		})
	},

	validMail:(req, res, next) => {
		if (!req.session.user) return next(err)
		Mailvalidator.findOne({user: req.session.user._id}, (err, mv) => {
			if (err || !mv) return next(err || Error(`MailValidator not exist`))
			if (req.params.url != mv.url) return next(Error(`Url isn't correct`))

			User.findOne({_id: req.session.user._id}, (err, user) => {
				if (err || !user) return next(err || Error('You are not found !'))
				user.mailvalided = true
				user.save(err => {
					if (err) return next(err)
					res.redirect('/me')
				})
			})

		})
	}
}


