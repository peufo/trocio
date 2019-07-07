var express = require('express')
var { checkLogin } = require('../controllers/utils')
var router = express.Router()
var got = require('got')

router
	.get('/', checkLogin, (req, res, next) => {
		res.render('workplace')
	})
	.get('/welcome', (req, res, next) => {
		res.render('index');
	})
	.get('/geocode/:query', (req, res, next) => {
		if (!process.env.OCD_API_KEY) return next(Error('Variable environement OCD_API_KEY is undefined ! Please visite https://opencagedata.com/api'))
		got(`https://api.opencagedata.com/geocode/v1/json?q=${req.params.query}&key=${process.env.OCD_API_KEY}`, {json: true})
		.then(response => {
			res.json(response.body)
		})
		.catch(next)
	})

module.exports = router;
