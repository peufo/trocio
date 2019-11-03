var pkg = require('./package.json')
var dev = process.env.NODE_ENV == 'development'

module.exports = {
	PORT: dev ? 3001 : 3000,
	DBPATH: dev ? `mongodb://localhost:27017/${pkg.name}-dev` : `mongodb://localhost:27017/${pkg.name}`,
	SECRET: `~WB)WNti,RICB|>Kjg!.@Pg_m4Vw:Zhm^&~wW.75$='1H$6qYY)%Fc==PK13i8c`,

	TROCIO_ADMIN: `trocio@trocio.com`,

	//Config SMTP
	SMTP_HOST: `localhost`, // address of your SMTP server
	SMTP_PORT: 465, // port of your SMTP server
	SMTP_USER: `user`, // user of your SMTP server
	SMTP_PASS: `password` // password of your SMTP
}