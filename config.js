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
*	BASE_MAIL_URL           basic link send in the mails					=>	http://localhost:3001/users/validmail
*
*/

module.exports = {
	PORT: dev ? 3001 : 3000,
	DBPATH: dev ? `mongodb://localhost:27017/${pkg.name}-dev` : `mongodb://localhost:27017/${pkg.name}`,
}