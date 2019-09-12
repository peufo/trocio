var User = require('../models/user')

module.exports = {

	checkLogin: (req, res, next) => {
		if (req.session.user) {
			next()
		}else{
			res.redirect('/welcome')
		}
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

	logout: (req, res, next) => {
		req.session.user = undefined
		res.redirect('/')
	}
}


