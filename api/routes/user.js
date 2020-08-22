let express 	= require('express')
let router = express.Router()
let { login, logout, checkSuperAdmin } = require('../controllers/user_utils')
let { createUser, patchMe, changepwd, resetpwd, sendValidMail, validMail} = require('../controllers/user_set')
let { getMe, searchUser, getUser, getUserName } = require('../controllers/user_get')

router
	.post('/', createUser)
	.post('/login', login)
	.get('/logout', logout)
	.post('/changepwd', changepwd)
	.post('/resetpwd', resetpwd)
	.post('/sendValidmail', sendValidMail)
	.get('/validmail/:id/:url', validMail)
	.patch('/me', patchMe)
	.get('/me', getMe)
	.get('/search/:search', searchUser)
	//.get('/:id', checkSuperAdmin, getUser)
	.get('/name/:id', getUserName)

module.exports = router