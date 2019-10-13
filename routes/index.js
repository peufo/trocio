var express = require('express')
var router = express.Router()
var got = require('got')
var path = require('path')
var bwipjs = require('bwip-js')
var { checkCashier, checkAdmin } = require('../controllers/troc')
var { checkLogin } = require('../controllers/user')

router
	.get('/', (req, res, next) => {
		res.sendFile(path.join(__dirname, '..', 'views', 'trocs.html'))
	})
	.get('/me', checkLogin, (req, res, next) => {
		res.sendFile(path.join(__dirname, '..', 'views', 'me.html'))
	})
	.get('/cashier/:id', checkCashier, (req, res, next) => {
		res.sendFile(path.join(__dirname, '..', 'views', 'cashier.html'))
	})
	.get('/admin/:id', checkAdmin, (req, res, next) => {
		res.sendFile(path.join(__dirname, '..', 'views', 'admin.html'))
	})
	.get('/geocode/:query', (req, res, next) => {
		if (!process.env.OCD_API_KEY) return next(Error('Variable environement OCD_API_KEY is undefined ! Please visite https://opencagedata.com/api'))
		got(`https://api.opencagedata.com/geocode/v1/json?q=${req.params.query}&language=fr&key=${process.env.OCD_API_KEY}`, {json: true})
		.then(response => {
			if (!response.body.results) return next(Error('No result'))
			var formatted = response.body.results.map(r => {
				return {
					address: r.formatted,
					location: r.geometry,
					_type: r.components._type,
					country_code: r.components.country_code
				}
			})
			res.json(formatted)
			//res.json(response.body)
		})
		.catch(next)
	})
	.get('/barcode', (req, res, next) => {
		bwipjs(req, res)
	})

module.exports = router;
