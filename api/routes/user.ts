import express from 'express'
const router = express.Router()
import {
  login,
  logout,
  loginWithGoogle,
  checkSuperAdmin,
} from '../controllers/user_utils'
import {
  createUser,
  patchMe,
  changepwd,
  resetpwd,
  sendValidMail,
  validMail,
} from '../controllers/user_set'
import { getMe, searchUser, getUserName } from '../controllers/user_get'

router
  .post('/', createUser, login, getMe)
  .post('/login', login, getMe)
  .get('/logout', logout)
  .get('/login-with-google', loginWithGoogle)
  .get('/me', getMe)
  .patch('/me', patchMe, getMe)
  .post('/me/changepwd', changepwd)
  .post('/me/resetpwd', resetpwd)
  .post('/me/validmail', sendValidMail)
  .get('/me/validmail/:validator', validMail)
// .get('/search', searchUser)
// .get('/:id',  getUser)
// .get('/name', getUserName)

export default router
