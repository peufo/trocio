import Article from '../models/article'
import Troc from '../models/troc'

import { getRoles } from './article_utils'
import { findSpec, getTarif, getFee, getMargin } from './troc_utils'
import { RequestHandler, Request } from 'express'
import { getRole } from './subscribe_util'
import type { Article as IArticle, EventName } from '../../types'
import Subscribe from '../models/subscribe'

function ensureArray<T extends any | any[]>(value: T | T[]): T[] {
  if (Array.isArray(value)) return value
  return [value]
}

/**
 * Création d'article permise
 * - Dans la limite du tarif attribué
 * - L'utilisateur est le fournisseur de l'article ou un cassier du troc
 */
export const createArticle: RequestHandler<void, any, IArticle | IArticle[]> =
  async (req, res, next) => {
    try {
      if (!req.session.user) throw 'Login is required'
      const isArray = Array.isArray(req.body)
      const articles = ensureArray(req.body)
      let { providerSubId, trocId } = articles[0]
      /** Permet de valider directement les articles */
      let accessorIsAdminOrCashier = false
      if (!providerSubId && !trocId)
        throw 'article need "providerSubId" or "trocId"'

      const sub = providerSubId
        ? await Subscribe.findById(providerSubId)
        : await Subscribe.findOne({ trocId, userId: req.session.user._id })
      const accessor = providerSubId
        ? await Subscribe.findOne({
            trocId: sub.trocId,
            userId: req.session.user._id,
          })
        : sub

      if (!sub || !accessor) throw `Subscribe not found`

      accessorIsAdminOrCashier =
        accessor.role === 'admin' || accessor.role === 'cashier'

      // Test le role de l'utilisateur connecté si celui ci n'est pas le fournisseur
      if (String(sub.userId) !== req.session.user._id) {
        if (!accessorIsAdminOrCashier) throw 'Not allowed'
      }

      // Trouve le troc et le tarif correspondant
      const troc = await Troc.findById(sub.trocId).exec()
      if (!troc) throw 'Troc is not found !'
      const tarif = await getTarif(sub._id)
      if (!tarif) throw 'Tarif is not found !'

      // Controle la limite du nombre d'article
      const articlesCount = await Article.countDocuments({
        trocId: sub.trocId,
        provider: sub.userId,
      })
      if (articlesCount + articles.length > tarif.maxarticles)
        throw `The limit of ${tarif.maxarticles} articles is reached`

      // Attribution d'une ref
      // Met a jour les state du troc
      const newRef = troc.articlelastref + 1
      troc.articlelastref += articles.filter((art) => !art.ref).length
      troc.save()

      const now = new Date()
      let nbAttributedRef = 0
      const articlesCreated = await Promise.all(
        articles.map((art) => {
          // @ts-ignore
          delete art._id

          /** Shortcuts */
          art.providerSubId = sub._id
          art.providerId = sub.userId
          art.trocId = sub.trocId

          if (accessorIsAdminOrCashier) {
            art.valided = now
            art.fee = getFee(art, tarif)
            art.validatorId = accessor.userId
            art.validatorSubId = accessor._id
          }
          /** Création de l'article */
          const article = new Article(art)
          if (!article.ref) article.ref = String(newRef + nbAttributedRef++)
          if (article.price === null) article.price = 0
          return article.save()
        })
      )

      if (isArray) return res.json(articlesCreated)
      res.json(articlesCreated[0])
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
    if (String(article.providerId) !== req.session.user._id) {
      const role = await getRole(article.trocId, req.session.user._id)
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
    if (String(article.providerId) !== req.session.user._id) {
      const role = await getRole(article.trocId, req.session.user._id)
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
    if (String(article.providerId) !== req.session.user._id) {
      const role = await getRole(article.trocId, req.session.user._id)
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

export const validArticles: RequestHandler = async (req, res, next) => {
  try {
    let { articles, subscribe, isArray } = await ensureCanEdit(req)
    const { valided } = req.body

    if (
      articles.filter(
        (art) => !art.valided && !art.refused && !art.sold && !art.recover
      ).length < articles.length
    )
      throw 'Articles status no permit this operation'

    const now = new Date()
    const tarif = await getTarif(articles[0].providerSubId)

    articles = await Promise.all(
      articles.map((article) => {
        if (valided) {
          article.valided = now
          article.fee = getFee(article, tarif)
        } else {
          article.refused = now
        }
        article.validatorId = req.session.user._id
        article.validatorSubId = subscribe._id
        return article.save()
      })
    )

    res.json(isArray ? articles : articles[0])
  } catch (error) {
    next(error)
  }
}

export const soldArticles: RequestHandler = async (req, res, next) => {
  try {
    let { articles, subscribe, isArray } = await ensureCanEdit(req)
    /** Si buyerSubId est fourni il s'agit d'une vente. Sinon, il s'agit d'une récupération */
    const { buyerSubId } = req.body

    if (
      articles.filter((art) => art.valided && !art.sold).length <
      articles.length
    )
      throw 'Articles status no permit this operation'

    const now = new Date()
    const tarif = await getTarif(articles[0].providerSubId)
    const buyerSub = buyerSubId
      ? await Subscribe.findById(buyerSubId)
      : undefined
    if (buyerSubId && !buyerSub) throw 'buyerSub not found'

    articles = await Promise.all(
      articles.map((article) => {
        if (buyerSubId) {
          article.sold = now
          article.buyerId = buyerSub.userId
          article.buyerSubId = buyerSubId
          article.margin = getMargin(article, tarif)
        } else {
          article.recover = now
        }
        article.sellerId = req.session.user._id
        article.sellerSubId = subscribe._id
        return article.save()
      })
    )

    res.json(isArray ? articles : articles[0])
  } catch (error) {
    next(error)
  }
}

export const cancelEvent: RequestHandler<any, any, { eventName: EventName }> =
  async (req, res, next) => {
    try {
      // TODO: create an historic
      let { articles, isArray } = await ensureCanEdit(req)
      const { eventName } = req.body

      articles = await Promise.all(
        articles.map((article) => {
          if (
            (eventName === 'refused' || eventName === 'valided') &&
            (article.sold || article.recover)
          )
            throw `Refused or valided events can't be canceled if article is already sold or recover `

          switch (eventName) {
            case 'refused':
            case 'valided':
              article.refused = undefined
              article.valided = undefined
              article.validatorId = undefined
              article.validatorSubId = undefined
              article.fee = undefined
              break
            case 'sold':
            case 'recover':
              article.sold = undefined
              article.recover = undefined
              article.sellerId = undefined
              article.sellerSubId = undefined
              article.buyerId = undefined
              article.buyerSubId = undefined
              article.margin = undefined
              break
            default:
              throw `eventName ${eventName} unknow`
          }

          return article.save()
        })
      )

      res.json(isArray ? articles : articles[0])
    } catch (error) {
      next(error)
    }
  }

/**
 * Garantie que l'utilisateur connecté peut gerer la liste d'articles
 * Parse le articlesId ou articleId
 */
async function ensureCanEdit(req: Request) {
  try {
    if (!req.session.user) throw 'Login required'
    const { articleId, articlesId } = req.body
    if (!articleId && !articlesId) throw 'articleId or articlesId is required'

    const isArray = !!articlesId

    if (isArray) {
      if (!Array.isArray(articlesId))
        throw 'articlesId string array is required in body'
      if (articlesId.length > 1000)
        throw `articlesId array can't containt more of 1000 items`
    }

    let articles = isArray
      ? await Article.find({ _id: { $in: articlesId } }).exec()
      : await Article.find({ _id: articleId }).exec()

    if (isArray) {
      // Assure que tout les articles viennent du même troc
      if (articles.map((a) => a.trocId.valueOf()).filter(beUnique).length > 1)
        throw 'All article need to come from the same troc'

      // Assure que tout les articles viennent du même fournisseur
      if (
        articles.map((a) => a.providerId.valueOf()).filter(beUnique).length > 1
      )
        throw 'All article need to come from the same provider'
    }

    // Assure que l'utilisateur connecté à le droit de validé les articles
    const subscribe = await Subscribe.findOne({
      trocId: articles[0].trocId,
      userId: req.session.user._id,
    }).exec()
    if (subscribe.role !== 'admin' && subscribe.role !== 'cashier')
      throw 'Not allowed'

    return { articles, subscribe, isArray }
  } catch (error) {
    throw error
  }
}

// TODO: A REVOIR à partir d'ici
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------
// ------------------------------------------------------------------------

/** @deprecated */
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

/** @deprecated */
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

/** @deprecated */
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
/** @deprecated */
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

function beUnique(elem: any, index: number, self: any[]) {
  return self.indexOf(elem) === index
}
