var express = require('express')
var { checkLogin } = require('../controllers/utils')
var router = express.Router()

router
	.get('/', checkLogin, (req, res, next) => {
		res.render('workplace')
	})
	.get('/connection', (req, res, next) => {
		res.render('index');
	})

module.exports = router;
