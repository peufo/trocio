import express from 'express'
const router = express.Router()

import {
  createArticle,
  editArticle,
  deleteArticle,
  goBackArticle,
  patchArticle,
  createNewPriceRequest,
  acceptNewPriceRequest,
} from '../controllers/article_set'
import {
  searchArticle,
  getArticle,
  getProvidedArticles,
  getPurchasesArticles,
  getGivbacksArticles,
} from '../controllers/article_get'
import { checkLogin } from '../controllers/user_utils'

router
  .post('/', checkLogin, createArticle)
  .get('/', searchArticle)
  .patch('/', checkLogin, patchArticle)
  .post('/edit', checkLogin, editArticle)
  .post('/giveback', checkLogin, goBackArticle)
  // .post('/newprice', checkLogin, createNewPriceRequest)
  // .post('/acceptnewprice', checkLogin, acceptNewPriceRequest)
  .get('/provided', getProvidedArticles)
  .get('/purschases', getPurchasesArticles)
  .get('/givebacks', getGivbacksArticles)
  .delete('/:articleId', checkLogin, deleteArticle)
  .get('/:articleId', getArticle)

export default router
