var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    host: 'mail.infomaniak.com',
    port: 587,
	auth: {
		user: 'postmaster@trocio.ch',
		pass: process.env.MAIL_PWD
	}
})

transporter.verify(function(error, success) {
    if (error) {
      console.log(error)
    } else {
      console.log("Server is ready to take our messages")
    }
})

var mailOptions = {
    from: 'TROCIO <postmaster@trocio.ch>'
}

module.exports = {

    createUser : (user, cb) => {
        mailOptions.to = user.mail
        mailOptions.subject = 'Création de votre compte - TROCIO'
        mailOptions.html = `
            <h2>Bienvenue sur Trocio</h2>
            <p>
                <b>${user.name}</b>, votre inscritpion c'est correctement déroulé.. 
            </p>
            <p>
                Cliquer ici pour accéder votre compte.
            </p>
            `
        transporter.sendMail(mailOptions, cb)
    },
            
    resetpwd: (user, newPwd, cb) => {
        mailOptions.to = user.mail
        mailOptions.subject = 'Réinitialisation de votre mot de passe - TROCIO'
        mailOptions.html = `
            <h2>Votre mot de passe à été réinitialisé</h2>
            <p>
                ${user.name}, votre nouveau mot de passe est désormais : <b>${newPwd}</b>
            </p>
        `
        transporter.sendMail(mailOptions, cb)
    }

}



