var User = require('../models/user')

module.exports = {

	checkLogin: (req, res, next) => {
		if (req.session.user) {
			next()
		}else{
			res.redirect('connection')
		}
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
						//La redirection ce fait côté client
						//res.redirect('/')
						res.json({success: true})
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
								next(Error('Erreur, raison introuvable!'))
						}
					}
				}else next(err)
			})			
		}
	}
}


