const User = require('../models/user')
const createError = require('http-errors')
const { TROCIO_ADMIN, TROCIO_FRONT_HOST, TROCIO_GOOGLE_CLIENT_ID, TROCIO_GOOGLE_CLIENT_SECRET } = require('../../config.js')
const axios = require('axios')
const qs = require('qs')
const mail = require('./mail')
const randomize = require('randomatic')

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
            if (err) return next(err)
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
            
        })			
    }
}

async function loginWithGoogle(req, res, next) {
    const { code, error, state } = req.query
    if (error) return next(error)

    const host = state.match(/^http:\/\/[^\/]+/)[0]

    const data = qs.stringify({
        client_id: TROCIO_GOOGLE_CLIENT_ID,
        client_secret: TROCIO_GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${host}/api/users${req.path}`
    })

    console.log({redirect_uri: `${host}api/users${req.path}`})
    const config = {
        method: 'post',
        url: 'https://oauth2.googleapis.com/token',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
        data
    }

    axios(config)
    .then(function (response) {
        const { access_token } = response.data
        if (!access_token) return next('access_token not provided')

        axios.get(`https://openidconnect.googleapis.com/v1/userinfo`, {params : {access_token}})
        .then(async function (response) {
            const {email, picture, email_verified, name} = response.data

            try{//Trouve l'utilisateur 
                let user = await User.findOne({mail: email}).exec()

                if (!user) { //Sinon créer un compte 
                    user = new User({name, mail: email, mailvalided: email_verified, password: randomize('0', 8)})
                    await user.save()
                    mail.createUser(user, err => {
                        if (err) console.log(err)
                    })
                    console.log(`Nouvelle utilisateur: ${user.name}`)
                }
                console.log(`Nouvelle connection de ${user.name}`)
                req.session.user = user

                return res.redirect(state)

            } catch(err) {
                return next(err)
            }
        })
        .catch(next)
    })
    .catch(next)

}

function logout(req, res, next) {
    req.session.user = undefined
    res.json({success: true, message: 'user logged out'})
}

module.exports = {
    checkLogin,
    checkSuperAdmin,
    login, 
    logout,
    loginWithGoogle
}