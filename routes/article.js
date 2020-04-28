var express = require('express')
var router = express.Router()

var { createArticle, deleteArticle, goBackArticle, patchArticle } = require('../controllers/article_set')
var { searchArticle } = require('../controllers/article_get')
var { checkLogin } = require('../controllers/user')

router
	.post('/', 			checkLogin, 	createArticle)
	.post('/giveback', 	checkLogin,		goBackArticle)
	.delete('/:id', 	checkLogin,		deleteArticle)
	.patch('/', 		checkLogin, 	patchArticle)
	.get('/', 			searchArticle)

module.exports = router