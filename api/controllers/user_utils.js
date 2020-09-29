let User = require('../models/user')
let createError = require('http-errors')
let { TROCIO_ADMIN } = require('../../config.js')

function checkLogin(req, res, next) {
    if (!req.session.user) return next(createError(401))
    next()
}

function checkSuperAdmin(req, res, next) {
    if (!req.session.user) return next(createError(401))
    if (!TROCIO_ADMIN) return next(Error('The environment variable TROCIO_ADMIN is undefined'))
    if (TROCIO_ADMIN != req.session.user.mail) return next(Error('Access denied'))
    next()
}
    
function login(req, res, next) {

    if (!req.body.mail || !req.body.password) {
        return next(createError(401))
    }else{
        User.getAuthenticated(req.body.mail, req.body.password, (err, user, reason) => {
            if (!err) {
                if (user) {
                    console.log(`Nouvelle connection de ${user.name}`)
                    
                    req.session.user = user
                    delete req.session.user.password //TODO: not work ?

                    //La redirection se fait côté client
                    //res.redirect('/users/me')
                    res.json({message: 'login successful'})
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
    res.json({success: true, message: 'user logged out'})
}

module.exports = {
    checkLogin,
    checkSuperAdmin,
    login, 
    logout
}