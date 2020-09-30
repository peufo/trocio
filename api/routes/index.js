const { TROCIO_OCD_API_KEY } = require('../../config.js')
let express = require('express')
let router = express.Router()
let got = require('got')
let path = require('path')
let bwipjs = require('bwip-js')

router
	.get('/geocode/:query', (req, res, next) => {
		if (!TROCIO_OCD_API_KEY) return next(Error('Variable environement TROCIO_OCD_API_KEY is undefined ! Please visite https://opencagedata.com/api'))
		got(`https://api.opencagedata.com/geocode/v1/json?q=${req.params.query}&language=fr&key=${TROCIO_OCD_API_KEY}`, {json: true})
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

module.exports = router
