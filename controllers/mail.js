var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'info@trocio.ch',
		pass: process.env.GMAIL_INFO_PWD
	}
})

var mailOptions = {
    from: 'info@trocio.ch'
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



