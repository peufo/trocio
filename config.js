var pkg = require('./package.json')
var dev = process.env.NODE_ENV == 'development'

/*	ENVIRONMENTS VARIABLES:
*
*	NAME_					ORIGIN_											EXEMPLE_
*
*	OCD_API_KEY             API key provide by https://opencagedata.com/	=>	1234XYZ
*	TROCIO_ADMIN            your mail address								=>	admin@trocio.ch
*	SECRET_STRING_COOKIE    A secret string for secure cookies				=>	1234XYZ
*	SMTP_HOST               address of your SMTP server						=>	mail.infomaniak.com
*	SMTP_PORT               port of your SMTP server						=>	587
*	SMTP_USER               user of your SMTP server						=>	postmaster@trocio.ch
*	SMTP_PASS               password of your SMTP							=>	1234XYZ
*	BASE_MAIL_URL           basic link send in the mails					=>	https://localhost:3001/users/validmail
*	(TROCIO_DB)				personalized DB name							=>	mongodb://localhost:27017/trocio
*	(TROCIO_PORT)			personalized PORT Number
*/

let PORT = 0
if (process.env.TROCIO_PORT) {
	PORT = parseInt(process.env.TROCIO_PORT, 10)
}else{
	PORT = dev ? 3001 : 3000
}

let DBPATH = 'mongodb://localhost:27017/'
if (process.env.TROCIO_DB) {
	DBPATH += process.env.TROCIO_DB
} else {
	DBPATH += dev ? `${pkg.name}-dev` : pkg.name
}

module.exports = { PORT, DBPATH }