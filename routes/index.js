let express = require('express')
let router = express.Router()
let got = require('got')
let path = require('path')
let bwipjs = require('bwip-js')
let { checkCashier, checkAdmin } = require('../controllers/troc')
let { getRoot } = require('./utils')

router
	.get('/', (req, res, next) => {
		res.render('../views/app.ejs', getRoot(req.path))
	})
	.get('/search', (req, res, next) => {
		//TODO: redirect to activity if user is loged ?
		res.render('../views/app.ejs', getRoot(req.path))
	})
	.get('/activity*', (req, res, next) => {
		res.render('../views/app.ejs', getRoot(req.path))
	})
	.get('/profile', (req, res, next) => {
		res.render('../views/app.ejs', getRoot(req.path))
	})
	.get('/cashier', checkCashier, (req, res, next) => {
		res.render('../views/app.ejs', getRoot(req.path))
	})
	.get('/admin', checkAdmin, (req, res, next) => {
		res.render('../views/app.ejs', getRoot(req.path))
	})
	.get('/mailConfirmation', (req, res, next) => {
		res.sendFile(path.join(__dirname, '..', 'views', 'mailConfirmation.html'))
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
