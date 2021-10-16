import express from 'express'
const router = express.Router()

import {
  createArticle,
  deleteArticle,
  editName,
  editPrice,
  editArticle,
  goBackArticle,
  patchArticle,
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
  .get('/', searchArticle)
  .post('/', createArticle)
  .delete('/', deleteArticle)
  .post('/edit-name', editName)
  .post('/edit-price', editPrice)
  // TODO: a revoir
  .patch('/', checkLogin, patchArticle)
  .post('/edit', checkLogin, editArticle)
  .post('/giveback', checkLogin, goBackArticle)
  // .post('/acceptnewprice', checkLogin, acceptNewPriceRequest)
  .get('/provided', getProvidedArticles)
  .get('/purschases', getPurchasesArticles)
  .get('/givebacks', getGivbacksArticles)
  .get('/:articleId', getArticle)

export default router
