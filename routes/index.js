var express = require('express');
var router = express.Router();

/* GET home page. */
router
	.get('/', function(req, res, next) {
	  res.render('index');
	})
	.get('/work', function(req, res, next) {
		res.render('workplace')
	})

module.exports = router;
