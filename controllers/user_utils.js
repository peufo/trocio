let User = require('../models/user')

function checkLogin(req, res, next) {
    if (!req.session.user) return next(Error('Login required'))
    next()
}

function checkSuperAdmin(req, res, next) {
    checkLogin(req, res, next)
    if (!process.env.TROCIO_ADMIN) return next(Error('The environment variable TROCIO_ADMIN is undefined'))
    if (process.env.TROCIO_ADMIN != req.session.user.mail) return next(Error('Access denied'))
    next()
}
    
function login(req, res, next) {

    if (!req.body.mail || !req.body.password) {
        return next(Error('Renseignement manquant !'))
    }else{
        User.getAuthenticated(req.body.mail, req.body.password, (err, user, reason) => {
            if (!err) {
                if (user) {
                    console.log(`Nouvelle connection de ${user.name}`)
                    
                    req.session.user = user
                    delete req.session.user.password //TODO: not work ?

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
}

function logout(req, res, next) {
    req.session.user = undefined
    res.redirect('/')
}

module.exports = {
    checkLogin,
    checkSuperAdmin,
    login, 
    logout
}