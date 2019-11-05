var nodemailer = require('nodemailer')
var Mailvalidator = require('../models/mailvalidator')
var randomize = require('randomatic')

var transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
	auth: {
		user: process.env.SMTP_USER,
		pass: process.env.SMTP_PASS
	}
})

transporter.verify(function(err, success) {
    if (err) {
      console.log(err)
    } else {
      console.log("Server is ready to take our messages")
    }
})

var mailOptions = {
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
                    <a href="${process.env.BASE_MAIL_URL}/${user._id}/${mailValidator.url}">
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
                    <a href="${process.env.BASE_MAIL_URL}/${user._id}/${mailValidator.url}">
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
