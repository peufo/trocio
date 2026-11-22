import express from 'express'
const router = express.Router()

import {
  createArticle,
  importArticles,
  deleteArticle,
  editName,
  editPrice,
  validArticles,
  soldArticles,
  recoverArticles,
  cancelEvent,
  bulkArticles,
} from '../controllers/article_set'
import {
  getArticles,
  getArticleCorrection,
  getArticleCountsByState,
  getArticleImportable,
  getArticlesSelection,
} from '../controllers/article_get'

router
  .get('/', getArticles)
  .post('/', createArticle)
  .delete('/', deleteArticle)
  .post('/import', importArticles)
  .post('/edit-name', editName)
  .post('/edit-price', editPrice)
  .post('/valid', validArticles)
  .post('/sold', soldArticles)
  .post('/recover', recoverArticles)
  .post('/cancel-event', cancelEvent)
  .post('/bulk', bulkArticles)
  .get('/selection', getArticlesSelection)
  .get('/corrections', getArticleCorrection)
  .get('/counts-by-state', getArticleCountsByState)
  .get('/importables', getArticleImportable)

export default router
