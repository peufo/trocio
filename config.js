require('dotenv').config()
let dev = process.env.NODE_ENV == 'development'

//Edit your configuration on .env file

const defaultConfig = {
	TROCIO_OCD_API_KEY: 			'', 					//API key provide by https://opencagedata.com/
	TROCIO_ADMIN: 					'',						//your mail address
	TROCIO_SECRET_STRING_COOKIE:	'',						//A secret string for secure cookies
	TROCIO_SMTP_PASS:				'',						//password of your SMTP server
	TROCIO_SMTP_USER:				'postmaster@trocio.ch',	
	TROCIO_SMTP_HOST:				'mail.infomaniak.com',	
	TROCIO_SMTP_PORT:				587,					
	TROCIO_FRONT_PORT:				5000,
	TROCIO_FRONT_HOST:				'http://localhost:5000',
	TROCIO_API_PORT:				5001,							
	TROCIO_API_HOST:				'http://localhost:5001',			
	TROCIO_DB:						'mongodb://localhost:27017/trocio',	
	TROCIO_BACKUP:					'../dump',
	TROCIO_DEV: 					dev,
	TROCIO_OPTION_FREE_TROC:		0,						//Nombre de troc autorisé avant bloquage. Il faut ensuite accordé des crédits.
}

module.exports = {...defaultConfig, ...process.env}
