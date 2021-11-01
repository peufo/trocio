import Article from '../models/article'
import User from '../models/user'
import Troc from '../models/troc'

import { getRoles, createArticleContext } from './article_utils'
import { findSpec, getTarif, getFee, getMargin } from './troc_utils'
import { RequestHandler } from 'express'
import { getRole } from './troc_get'

/**
 * Création d'article permise
 * - Dans la limite du tarif attribué
 * - L'utilisateur est le fournisseur de l'article ou un cassier du troc
 */
export const createArticle: RequestHandler = async (req, res, next) => {
  const isArray = Array.isArray(req.body)
  const articles = isArray ? req.body : [req.body]
  const providerId = articles[0].provider || req.session.user._id
  const trocId = articles[0].troc

  try {
    if (!req.session.user) throw 'Login is required'

    // Test le role de l'utilisateur si celui ci n'est pas le fournisseur
    if (providerId !== req.session.user._id) {
      const role = await getRole(trocId, req.session.user._id)
      if (role !== 'admin' && role !== 'cashier') throw 'Not allowed'
    }

    // Trouve le troc et le tarif correspondant
    const troc = await Troc.findById(trocId).exec()
    if (!troc) throw 'Troc is not found !'
    const tarif = await getTarif(trocId, providerId)
    if (!tarif) throw 'Tarif is not found !'

    // Controle la limite du nombre d'article
    const articlesCount = await Article.countDocuments({
      troc: trocId,
      provider: providerId,
    })
    if (articlesCount + articles.length > tarif.maxarticles)
      throw `The limit of ${tarif.maxarticles} articles is reached`

    // Attribution d'une ref
    // Met a jour les state du troc
    const newRef = troc.articlelastref + 1
    troc.articlelastref += articles.filter((art) => !art.ref).length
    troc.articles += articles.length
    troc.save()

    // Formatage des articles
    articles.forEach((art) => {
      art.provider = providerId
      delete art._id
    })

    let nbAttributedRef = 0
    await Promise.all(
      articles.map((art) => {
        art = new Article(art)
        if (!art.ref) art.ref = newRef + nbAttributedRef++
        if (art.price === null) art.price = 0
        return art.save()
      })
    )

    if (isArray) res.json(articles)
    else res.json(articles[0])
  } catch (error) {
    next(error)
  }
}

/**
 * Suppression d'un article permise si
 * - L'article n'est pas validé
 * - L'utilisateur est le fournisseur de l'article ou un cassier du troc
 */
export const deleteArticle: RequestHandler = async (req, res, next) => {
  try {
    const { articleId } = req.body
    if (!req.session.user) throw 'Login is required'
    if (!articleId) throw 'articleId query is required'

    const article = await Article.findById(articleId).exec()
    if (!article) throw 'Article not found'
    if (article.valided) throw `Valided article can't be delete`

    // Test le role de l'utilisateur si celui ci n'est pas le fournisseur
    if (article.provider !== req.session.user._id) {
      const role = await getRole(article.troc, req.session.user._id)
      if (role !== 'admin' && role !== 'cashier') throw 'Not allowed'
    }

    await article.remove()

    res.json({
      success: true,
      message: `Article ${articleId} is removed`,
    })
  } catch (error) {
    next(error)
  }
}

/**
 * Modification du nom d'un article permis si
 * - L'utilisateur est le fournisseur de l'article ou un cassier du troc
 */
export const editName: RequestHandler<
  void,
  void,
  { articleId: string; newName: string }
> = async (req, res, next) => {
  let { articleId, newName } = req.body
  try {
    if (!articleId) throw 'articleId string is required in body'
    if (!newName) throw 'newName number is required in body'

    const article = await Article.findById(articleId).exec()

    // Test le role de l'utilisateur si celui ci n'est pas le fournisseur
    if (article.provider !== req.session.user._id) {
      const role = await getRole(article.troc, req.session.user._id)
      if (role !== 'admin' && role !== 'cashier') throw 'Not allowed'
    }

    article.name = newName
    await article.save()
    res.json(article)
  } catch (error) {
    next(error)
  }
}

/**
 * Modification du prix d'un article permis si
 * - L'article n'est pas vendu
 * - L'utilisateur est le fournisseur de l'article ou un cassier du troc
 * TODO: ne permetre qu'un baisse du prix si l'article est validé ?
 */
export const editPrice: RequestHandler<
  void,
  void,
  { articleId: string; newPrice: number }
> = async (req, res, next) => {
  let { articleId, newPrice } = req.body
  try {
    if (!articleId) throw 'articleId string is required in body'
    if (!newPrice) throw 'newPrice number is required in body'

    const article = await Article.findById(articleId).exec()
    if (article.sold) throw `Solded article's price can't be edited`

    // Test le role de l'utilisateur si celui ci n'est pas le fournisseur
    if (article.provider !== req.session.user._id) {
      const role = await getRole(article.troc, req.session.user._id)
      if (role !== 'admin' && role !== 'cashier') throw 'Not allowed'
    }

    // TODO: Avertir l'organisateur si ce n'est pas lui qui la fait la demande et inversément

    article.price = newPrice
    await article.save()
    res.json(article)
  } catch (error) {
    next(error)
  }
}

// TODO: A REVOIRE à partir d'ici
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------

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
  editPrice,
  acceptNewPriceRequest,
  patchArticle,
}
