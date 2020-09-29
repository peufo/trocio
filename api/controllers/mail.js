let nodemailer = require('nodemailer')
let Mailvalidator = require('../models/mailvalidator')
let randomize = require('randomatic')
const { 
    TROCIO_API_HOST,
    TROCIO_SMTP_HOST,
    TROCIO_SMTP_PORT,
    TROCIO_SMTP_PASS,
    TROCIO_SMTP_USER
} = require('../../config.js')

let transporter = nodemailer.createTransport({
    host: TROCIO_SMTP_HOST,
    port: TROCIO_SMTP_PORT,
	auth: {
		user: TROCIO_SMTP_USER,
		pass: TROCIO_SMTP_PASS
	}
})

transporter.verify(function(err, success) {
    if (err) {
        console.log('Mail configuration error')
    } else {
        console.log("Server is ready to take our messages")
    }
})

let mailOptions = {
    from: 'TROCIO <postmaster@trocio.ch>'
}

module.exports = {

    createUser : (user, cb) => {
        getUrlValidMail(user, (err, mailValidator) => {
            mailOptions.to = user.mail
            mailOptions.subject = 'Création de votre compte - TROCIO'
            mailOptions.html = `
                <h2>Bienvenue sur Trocio</h2>
                <p>
                    <b>${user.name}</b>, votre inscription s'est correctement déroulé. 
                </p>
                <p>
                    <a href="${TROCIO_API_HOST}/users/validmail/${user._id}/${mailValidator.url}">
                        Cliquer ici pour valider votre adresse mail.
                    </a>
                </p>
                `
            transporter.sendMail(mailOptions, cb)
        })
    },
            
    resetpwd: (user, unchiffredPwd, cb) => {
        mailOptions.to = user.mail
        mailOptions.subject = 'Réinitialisation de votre mot de passe - TROCIO'
        mailOptions.html = `
            <h2>Votre mot de passe a été réinitialisé</h2>
            <p>
                ${user.name}, votre nouveau mot de passe est désormais : <b>${unchiffredPwd}</b>
            </p>
        `
        transporter.sendMail(mailOptions, cb)
    },

    sendValidMail: (user, cb) => {
        getUrlValidMail(user, (err, mailValidator) => {
            if (err) return cb(err)
            mailOptions.to = user.mail
            mailOptions.subject = 'Validation de votre mail - TROCIO'
            mailOptions.html = `
                <h2>Validation de votre adresse mail</h2>
                <p>
                    <a href="${TROCIO_API_HOST}/${user._id}/${mailValidator.url}">
                        Cliquer ici pour valider votre adresse mail.
                    </a>
                </p>
            `
            transporter.sendMail(mailOptions, cb)
        })
    },
}


function getUrlValidMail(user, cb) {
 
    Mailvalidator.findOne({user: user._id}, (err, mv) => {
        if (err) return next(err)
        if (mv) {
            mv.validity = +new Date() + 10*60*60*1000
            mv.url = randomize('a0', 256)
            mv.save(err => {
                if (err) return next(err)
                cb(null, mv)
            })
        }else{
            mv = new Mailvalidator({user: user._id, url: randomize('a0', 256)})
            mv.save(cb)
        }
    })

}
