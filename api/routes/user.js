let express = require('express')
let router = express.Router()
let {
  login,
  logout,
  loginWithGoogle,
  checkSuperAdmin,
} = require('../controllers/user_utils')
let {
  createUser,
  patchMe,
  changepwd,
  resetpwd,
  sendValidMail,
  validMail,
} = require('../controllers/user_set')
let {
  getMe,
  searchUser,
  getUser,
  getUserName,
} = require('../controllers/user_get')

router
  .post('/', createUser, login, getMe)
  .post('/login', login, getMe)
  .get('/login-with-google', loginWithGoogle)
  .get('/me', getMe)
  .patch('/me', patchMe, getMe)
  .get('/logout', logout)
  .post('/changepwd', changepwd)
  .post('/resetpwd', resetpwd)
  .post('/validmail', sendValidMail)
  .get('/validmail/:validator', validMail)
  .get('/search', searchUser)
  //.get('/:id', checkSuperAdmin, getUser)
  .get('/name/:id', getUserName)

module.exports = router
