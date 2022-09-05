import express from 'express'
const router = express.Router()

import {
  createArticle,
  deleteArticle,
  editName,
  editPrice,
  validArticles,
  soldArticles,
  cancelEvent,
} from '../controllers/article_set'
import {
  getArticles,
  getArticleCorrection,
  getArticleCountsByState,
} from '../controllers/article_get'

router
  .get('/', getArticles)
  .post('/', createArticle)
  .delete('/', deleteArticle)
  .get('/counts-by-state', getArticleCountsByState)
  .post('/edit-name', editName)
  .post('/edit-price', editPrice)
  .post('/valid', validArticles)
  .post('/sold', soldArticles)
  .post('/cancel-event', cancelEvent)
  .get('/corrections', getArticleCorrection)

export default router
