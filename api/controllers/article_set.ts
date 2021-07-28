import Article from '../models/article'
import User from '../models/user'
import Troc from '../models/troc'

import { getRoles, createArticleContext } from './article_utils'
import { findSpec, getFee, getMargin } from './troc_utils'
import { RequestHandler } from 'express'

export async function createArticle(req, res, next) {
  const isArray = Array.isArray(req.body)
  const articles = isArray ? req.body : [req.body]
  const providerId = articles[0].provider || req.session.user._id
  const trocId = articles[0].troc

  console.log({ providerId })

  try {
    // Trouve le troc et le tarif correspondant
    const [troc, { tarif }] = await Promise.all([
      Troc.findById(trocId).then((troc) => {
        if (!troc) throw Error('Troc is not found !')
        if (troc.isClosed) throw Error('Troc is closed')
        return troc
      }),
      findSpec(trocId, providerId),
    ])

    console.log({ troc, tarif })

    //TODO: Verifier la limite du nombre d'article

    // Attribution d'une ref
    // Met a jour les state du troc
    let newRef = troc.articlelastref + 1
    troc.articlelastref += articles.filter((art) => !art.ref).length
    troc.articles += articles.length
    troc.save()

    // Formatage des articles
    articles.forEach((art) => {
      art.provider = providerId
      delete art._id
    })

    let nbAttributedRef = 0
    Promise.all(
      articles.map((art) => {
        return new Promise((resolve, reject) => {
          art = new Article(art)
          if (!art.ref) art.ref = newRef + nbAttributedRef++
          if (art.price === null) art.price = 0
          else {
            art.fee = getFee(art, tarif)
            art.margin = getMargin(art, tarif)
          }
          art.save((err) => {
            if (err) return reject(err)
            else return resolve(art)
          })
        })
      })
    )
      .catch(next)
      .then((articles) => {
        if (isArray) res.json(articles)
        else res.json(articles[0])
      })
  } catch (error) {
    next(error)
  }
}

export function deleteArticle(req, res, next) {
  Article.findOne({ _id: req.params.articleId }, (err, art) => {
    if (err || !art) return next(err || Error('Article not found'))
    if (art.valided) return next(Error(`Valided article can't be delete`))
    art.remove((err) => {
      if (err) return next(err)
      res.json({
        success: true,
        message: `Article ${req.params.articleId} is removed`,
      })
    })
  })
}

export const goBackArticle: RequestHandler = async (req, res, next) => {
  const errors = []
  const ids = req.body.map((a) => a._id)
  Article.find({ _id: { $in: ids } }, (err, articles) => {
    if (err || articles.length != req.body.length)
      return next(err || Error('Article not found'))
    articles.forEach(async (art, index) => {
      art.giveback.push(req.body[index].giveback)
      art.sold = undefined
      art.buyer = undefined
      let err = await art.save()
      if (err) errors.push(err)
      return
    })
    if (errors.length) return next(errors[0])
    res.json(articles)
  })
}

export function createNewPriceRequest(req, res, next) {
  let { _id, price } = req.body
  if (!_id || !price) return next(Error('_id and price are request'))

  Article.findOne({ _id: _id }).exec((err, article) => {
    if (err || !article) return next(err || Error('Article not found'))

    getRoles(req.session.user._id, article, (err, roles) => {
      if (err) return next(err)
      if (roles.indexOf('cashier') == -1)
        return next(Error('You need to be a cashier for this operation'))

      article.newPriceRequest = {
        applicant: req.session.user._id,
        createdAt: new Date(),
        price: price,
      }

      article.save((err) => {
        if (err) return next(err)
        res.json({
          success: true,
          message: 'New price request is created',
          data: article,
        })
        //TODO: add Push notify to provider
      })
    })
  })
}

export function acceptNewPriceRequest(req, res, next) {
  let { _id } = req.body
  if (!_id) return next(Error('_id is request'))
  Article.findOne({ _id: _id }).exec((err, article) => {
    if (err) return next(err)

    getRoles(req.session.user._id, article, (err, roles) => {
      if (err) return next(err)
      if (roles.indexOf('provider') == -1)
        return next(Error('You need to be a provider for this operation'))

      article.price = article.newPriceRequest.newPrice
      article.newPriceRequest = undefined

      article.save((err) => {
        if (err) return next(err)
        res.json({
          success: true,
          message: 'New price request is accepted',
          data: article,
        })
      })
    })
  })
}

export function patchArticle(req, res, next) {
  let patchedArticles = req.body
  if (!Array.isArray(req.body)) patchedArticles = [patchedArticles]
  let errors = []
  let ids = patchedArticles.map((a) => a._id)
  let uniqueTroc = false
  let uniqueProvider = false

  Article.find({ _id: { $in: ids } }).exec((err, articles) => {
    if (err || !articles.length) return next(err || Error('Articles not found'))

    //Check if all articles become from the same troc
    uniqueTroc =
      articles
        .map((a) => a.troc.toString())
        .filter((v, i, self) => self.indexOf(v) === i).length == 1
    if (!uniqueTroc)
      return next(Error('All articles not becomes from the same troc'))

    getRoles(req.session.user._id, articles[0], async (err, roles) => {
      if (err) return next(err)
      if (!roles.length) return next(Error('Not authorized'))

      //Find tarif to apply it if price change
      let { tarif } = await findSpec(trocId, articles[0].provider)

      if (roles.indexOf('provider') != -1) {
        //Check if all articles become from the same provider
        uniqueProvider =
          articles
            .map((a) => a.provider.toString())
            .filter((v, i, self) => self.indexOf(v) === i).length == 1
        if (!uniqueProvider)
          return next(Error('All articles not becomes from the same provider'))

        //if (err) return next(Error(err))

        articles = articles.map((art) => {
          let patchedArt = patchedArticles[ids.indexOf(String(art._id))]
          let err = undefined

          //Check if the user is the provider (roles is not define for all articles)
          if (
            req.session.user._id != art.provider ||
            req.session.user._id != art.provider._id
          ) {
            err = Error('Provider not identified')
          }

          //PATCH
          if (!art.valided) {
            if (patchedArt.name) art.name = patchedArt.name
            if (!isNaN(patchedArt.price) && patchedArt.price !== null) {
              art.price = patchedArt.price
              art.fee = getFee(art, tarif)
              art.margin = getMargin(art, tarif)
            }
          }

          if (err) errors.push(err)
          return art
        })
      }

      if (roles.indexOf('cashier') != -1) {
        articles = articles.map((art) => {
          let patchedArt = patchedArticles[ids.indexOf(String(art._id))]

          let validedPatched =
            patchedArt.valided && patchedArt.valided != art.valided
          let refusedPatched =
            patchedArt.refused && patchedArt.refused != art.refused
          let soldPatched = patchedArt.sold && patchedArt.sold != art.sold
          let recoverPatched =
            patchedArt.recover && patchedArt.recover != art.recover

          //PATCH
          if (!art.valided) {
            if (!isNaN(patchedArt.price) && patchedArt.price !== null) {
              art.price = patchedArt.price
              art.fee = getFee(art, tarif)
              art.margin = getMargin(art, tarif)
            }
          }
          if (patchedArt.name) art.name = patchedArt.name
          if (patchedArt.valided) art.valided = patchedArt.valided
          if (patchedArt.refused) art.refused = patchedArt.refused
          if (patchedArt.sold) art.sold = patchedArt.sold
          if (patchedArt.recover) art.recover = patchedArt.recover
          if (patchedArt.buyer) art.buyer = patchedArt.buyer

          if (validedPatched || refusedPatched)
            art.validator = req.session.user._id
          if (soldPatched || recoverPatched) art.seller = req.session.user._id

          //Verification du status de l'article
          let err = undefined
          if (art.valided && art.refused)
            err = Error(`Un article ne peut pas être validé et refusé`)
          if (art.sold && art.recover)
            err = Error(`Un article ne peut pas être vendu et récupéré`)
          if (!art.valided && (art.sold || art.recover))
            err = Error(
              `Un article doit être validé pour être vendu ou récupéré`
            )

          //if (!err) err = await art.save()
          if (err) errors.push(err)

          return art
        })
      }

      if (errors.length) return next(errors[0])

      Promise.all(
        articles.map((art) => {
          return new Promise((resolve, reject) => {
            art.save((err) => {
              if (err) return reject(err)
              else return resolve(art)
            })
          })
        })
      )
        .then(() => {
          if (Array.isArray(req.body)) {
            res.json({ success: true, message: articles })
          } else {
            res.json({ success: true, message: articles[0] })
          }
        })
        .catch(next)
    })
  })
}

//TODO: for replace patch article ?
export async function editArticle(req, res, next) {
  try {
    let { edits, article } = req.body
    if (!edits || !article) throw 'edit and article is required on the body'

    article = await Article.findById(article).exec()
    if (!article) throw 'Article not found'
    getRoles(req.session.user._id, article, async (err, roles) => {
      if (err) return next(err)
      if (roles.indexOf('admin') === -1)
        throw 'You have not admin right on this article'

      edits.forEach(({ key, type, value }) => {
        if (type === 'write') {
          article[key] = value
        } else if (type === 'erase') {
          article[key] = undefined
        }
      })

      //Mise a jour du prix dans le cas d'un changement de prix
      if (edits.map((edit) => edit.key).indexOf('price') > -1) {
        let { tarif } = await findSpec(article.troc, article.provider)
        article.fee = getFee(article, tarif)
        article.margin = getMargin(article, tarif)
      }

      //Validation de l'article
      if (article.valided && article.refused)
        err = Error(`Un article ne peut pas être validé et refusé`)
      if (article.sold && article.recover)
        err = Error(`Un article ne peut pas être vendu et récupéré`)
      if (!article.valided && (article.sold || article.recover))
        err = Error(`Un article doit être validé pour être vendu ou récupéré`)
      if (err) return next(err)

      article.save((err) => {
        if (err) return next(err)
        res.json({ success: true, message: article })
      })
    })
  } catch (error) {
    return next(error)
  }
}

export default {
  createArticle,
  editArticle,
  deleteArticle,
  goBackArticle,
  createNewPriceRequest,
  acceptNewPriceRequest,
  patchArticle,
}
