var express = require('express')
var router = express.Router()
var got = require('got')

router
	.get('/', (req, res, next) => {
		res.render('workplace')
	})
	.get('/welcome', (req, res, next) => {
		res.render('index') // sera une version légère de workplace
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

module.exports = router;
