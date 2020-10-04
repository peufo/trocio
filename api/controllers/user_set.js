let User = require('../models/user')
let Mailvalidator = require('../models/mailvalidator')
let mail = require('./mail')
let randomize = require('randomatic')


function createUser(req, res, next) {

    //Dans le cas ou l'utilisateur est déjà connecté
    //il sagit d'un cassier qui créer un compte pour un client 
    //Un mot de passe est générer et returné
    var genPwd = ''
    if (req.session.user) {
        genPwd = randomize('0', 6)
        req.body.password = genPwd
    }

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
            if (err) console.log(err)
        })

        if (req.session.user) {
            user.password = genPwd
            res.status(201).json({success: true, message: user})
        }else{
            res.status(201).json({success: true, message: 'Inscritpion réussie!'})
        }

    })
}

function patchMe(req, res, next) {
    if (!req.session.user) return next(Error('Login required'))

    User.findById(req.session.user._id, (err, user) => {
        if (err || !user) return next(err || Error('User not found !'))
        if (req.body._id) delete req.body._id
        if (req.body.mailvailded) delete req.body.mailvailded
        if (req.body.trocs) delete req.body.trocs
        if (req.body.loginAttempts) delete req.body.loginAttempts
        for (var p in req.body){user[p] = req.body[p]}

        console.log('prout A')
        user.save(err => {
            if (err) return next(err)
            res.json({success: true})
            console.log('prout B')
        })
    })
}

function changepwd(req, res, next) {
    let user = req.session.user
    let oldPassword = req.body.oldPassword
    let newPassword = req.body.newPassword
    if (!user) return next()
    User.getAuthenticated(user.mail, oldPassword, (err, user, reason) => {
        if (err || !user) return next(err || "User not found")
        user.password = newPassword
        user.save(err => {
            if (err) return next(err)
            res.json({success: true, message: 'Password changed !'})
        })
    })
}

function resetpwd(req, res, next) {
    User.findOne({mail: req.body.mail}, (err, user) => {
        if (err || !user) return next(err || "User not found")
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
}

function sendValidMail(req, res, next) {
    if (!req.session.user) return next(Error('Login required'))
    mail.sendValidMail(req.session.user, err => {
        if (err) return next(err)
        res.json({success: true, message: `Mail sent for validation on address ${req.session.user.mail}`})
    })
}

function validMail(req, res, next) {

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
                    else res.redirect('/mail-confirmation')
                })					
            })
        })
    })
}

module.exports = {
    createUser,
    changepwd,
    resetpwd,
    sendValidMail,
    validMail,
    patchMe
}