import express from 'express'
const router = express.Router()
import { login, logout, loginWithGoogle } from '../controllers/user_utils'
import {
  createUser,
  patchMe,
  changepwd,
  sendResetPwd,
  resetpwd,
  sendValidMail,
  validMail,
} from '../controllers/user_set'
import { getMe, getUserName } from '../controllers/user_get'

router
  .post('/', createUser, login, getMe)
  .post('/login', login, getMe)
  .get('/logout', logout)
  .get('/login-with-google', loginWithGoogle)
  .get('/me', getMe)
  .patch('/me', patchMe, getMe)
  .post('/me/changepwd', changepwd)
  .post('/me/send-resetpwd', sendResetPwd)
  .post('/me/resetpwd', resetpwd)
  .post('/me/send-validmail', sendValidMail)
  .post('/me/validmail', validMail)
  .get('/name', getUserName)

export default router
