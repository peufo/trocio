import type { RequestHandler, Request } from 'express'
import mongoose from 'mongoose'

import Troc from '../models/troc'
import Article from '../models/article'
import { getTarif, getFee, getMargin } from './article_utils'
import type {
  ArticleCreate,
  ArticleState,
  ArticleCorrection,
} from '../../types'
import { getRole } from './access'
import Subscribe from '../models/subscribe'

const { ObjectId } = mongoose.Types

function ensureArray<T extends any | any[]>(value: T | T[]): T[] {
  if (Array.isArray(value)) return value
  return [value]
}

async function useCreateArticlePermission(
  req: Request,
  data: ArticleCreate | ArticleCreate[]
) {
  if (!req.session.user) throw 'Login is required'
  const isArray = Array.isArray(data)
  const articles = ensureArray(data)
  let { providerSubId, trocId } = articles[0]
  /** Permet de valider directement les articles */
  let accessorIsAdminOrCashier = false
  if (!providerSubId && !trocId)
    throw 'article need "providerSubId" or "trocId"'

  const sub = providerSubId
    ? await Subscribe.findById(providerSubId)
    : await Subscribe.findOne({ trocId, userId: req.session.user._id })
  if (!sub) throw new Error('sub not found')

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
    providerSubId: sub._id,
  })
  if (articlesCount + articles.length > tarif.maxarticles)
    throw `The limit of ${tarif.maxarticles} articles is reached`
  return {
    isArray,
    articles,
    troc,
    subscribe: sub,
  }
}

/**
 * Création d'article permise
 * - Dans la limite du tarif attribué
 * - L'utilisateur est le fournisseur de l'article ou un cassier du troc
 */
export const createArticle: RequestHandler<
  any,
  any,
  ArticleCreate | ArticleCreate[]
> = async (req, res, next) => {
  try {
    const { isArray, troc, articles, subscribe } =
      await useCreateArticlePermission(req, req.body)

    // Attribution d'une ref
    // Met a jour les state du troc
    const newRef = troc.articlelastref + 1
    troc.articlelastref += articles.filter((art) => !art.ref).length
    troc.save()

    let nbAttributedRef = 0

    const articlesCreated = await Article.insertMany(
      articles.map((art, index) => {
        /** Shortcuts */
        art.providerSubId = subscribe._id
        art.providerId = subscribe.userId
        art.trocId = subscribe.trocId

        /** Preserve order */
        art.index = index

        /** Création de l'article */
        const article = new Article(art)
        if (!article.ref) article.ref = String(newRef + nbAttributedRef++)
        if (article.price === null) article.price = 0
        return article
      })
    )

    if (isArray) return res.json(articlesCreated)
    res.json(articlesCreated[0])
  } catch (error) {
    next(error)
  }
}

export const importArticles: RequestHandler = async (req, res, next) => {
  try {
    const { articles, subscribe } = await useCreateArticlePermission(
      req,
      req.body
    )

    const articlesId = articles.map((art) => new ObjectId(art._id))

    const [articlesCreated, results] = await Promise.all([
      Article.insertMany(
        articles.map((art, index) => {
          art.providerSubId = subscribe._id
          art.providerId = subscribe.userId
          art.trocId = subscribe.trocId
          delete art._id
          const article = new Article(art)
          return article
        })
      ),
      Article.updateMany(
        { _id: { $in: articlesId } },
        { $set: { isCopied: true } }
      ),
    ])

    return res.json(articlesCreated)
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
  any,
  { articleId: string; name: string }
> = async (req, res, next) => {
  let { articleId, name } = req.body
  try {
    if (!req.session.user) throw 'login required'
    if (!articleId) throw 'articleId string is required in body'
    if (!name) throw 'name string is required in body'

    const article = await Article.findById(articleId).exec()
    if (!article) throw 'Article not found'
    if (article.sold || article.recover)
      throw `Solded or recovered article's can't be edited`

    const accessor = await Subscribe.findOne({
      trocId: article.trocId,
      userId: req.session.user?._id,
    })
    if (!accessor) throw 'Accessor subscribe not found'

    // Test le role de l'utilisateur
    if (accessor.role !== 'admin' && accessor.role !== 'cashier') {
      if (String(article.providerId) !== req.session.user._id)
        throw 'Not allowed'
      if (article.valided) throw `Valided article can't be edited by provider`
    }

    // Enregistre la l'historique de corrections
    article.corrections.push({
      authorId: req.session.user._id,
      authorSubId: accessor._id,
      event: 'edit-name',
      oldValue: article.name,
      newValue: name,
      timestamp: new Date(),
    })

    article.name = name
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
 */
export const editPrice: RequestHandler<
  void,
  any,
  { articleId: string; price: number }
> = async (req, res, next) => {
  let { articleId, price } = req.body
  try {
    if (!req.session.user) throw 'login required'
    if (!articleId) throw 'articleId string is required in body'
    if (!price) throw 'price number is required in body'

    const article = await Article.findById(articleId).exec()
    if (!article) throw 'Article not found'
    if (article.sold || article.recover)
      throw `Solded or recovered article's can't be edited`

    const accessor = await Subscribe.findOne({
      trocId: article.trocId,
      userId: req.session.user._id,
    })
    if (!accessor) throw 'Accessor subscribe not found'

    // Test le role de l'utilisateur
    if (accessor.role !== 'admin' && accessor.role !== 'cashier') {
      if (String(article.providerId) !== req.session.user._id)
        throw 'Not allowed'
      if (article.valided) throw `Valided article can't be edited by provider`
    }

    // Enregistre la l'historique de corrections
    article.corrections.push({
      authorId: req.session.user._id,
      authorSubId: accessor._id,
      event: 'edit-price',
      oldValue: article.price,
      newValue: price,
      timestamp: new Date(),
    })

    article.price = price
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

    articles = await Promise.all(
      articles.map(async (article) => {
        if (valided) {
          article.valided = now
          article.fee = await getFee(article)
        } else {
          article.refused = now
        }
        article.validatorId = subscribe.userId
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
    let { articles, subscribe, isArray, userId } = await ensureCanEdit(
      req,
      false
    )
    const { buyerSubId } = req.body
    if (!buyerSubId) throw 'buyerSubId is required'

    if (
      articles.filter((art) => art.valided && !art.sold).length <
      articles.length
    )
      throw 'Articles status no permit this operation'

    const now = new Date()

    const buyerSub = await Subscribe.findById(buyerSubId)

    if (!buyerSub) throw 'buyerSub not found'

    articles = await Promise.all(
      articles.map(async (article) => {
        article.sold = now
        article.buyerId = buyerSub.userId
        article.buyerSubId = buyerSubId
        article.margin = await getMargin(article)
        article.sellerId = userId
        article.sellerSubId = subscribe._id
        return article.save()
      })
    )

    res.json(isArray ? articles : articles[0])
  } catch (error) {
    next(error)
  }
}

export const recoverArticles: RequestHandler = async (req, res, next) => {
  try {
    let { articles, subscribe, isArray, userId } = await ensureCanEdit(
      req,
      false
    )

    if (
      articles.filter((art) => art.valided && !art.sold).length <
      articles.length
    )
      throw 'Articles status no permit this operation'

    articles = await Promise.all(
      articles.map(async (article) => {
        article.recover = new Date()
        article.sellerId = userId
        article.sellerSubId = subscribe._id
        return article.save()
      })
    )

    res.json(isArray ? articles : articles[0])
  } catch (error) {
    next(error)
  }
}

export const cancelEvent: RequestHandler<
  any,
  any,
  { eventName: ArticleState }
> = async (req, res, next) => {
  try {
    let { articles, isArray, subscribe, userId } = await ensureCanEdit(req)
    const { eventName } = req.body

    const correctionBase: Omit<ArticleCorrection, 'event'> = {
      authorId: userId,
      authorSubId: subscribe._id,
      timestamp: new Date(),
    }

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
            article.fee = 0
            article.corrections.push({
              ...correctionBase,
              event:
                eventName === 'refused' ? 'cancel-refused' : 'cancel-valided',
            })
            break
          case 'sold':
          case 'recover':
            article.sold = undefined
            article.recover = undefined
            article.sellerId = undefined
            article.sellerSubId = undefined
            article.buyerId = undefined
            article.buyerSubId = undefined
            article.margin = 0
            article.corrections.push({
              ...correctionBase,
              event: eventName === 'sold' ? 'cancel-sold' : 'cancel-recover',
            })
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
async function ensureCanEdit(req: Request, needFromSameProvider = true) {
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
      if (articles.map((a) => a.trocId?.valueOf()).filter(beUnique).length > 1)
        throw 'All article need to come from the same troc'

      // Assure que tout les articles viennent du même subscribe de fournisseur
      if (
        needFromSameProvider &&
        articles.map((a) => a.providerSubId.valueOf()).filter(beUnique).length >
          1
      )
        throw 'All article need to come from the same provider subscribe'
    }

    // Assure que l'utilisateur connecté à le droit de validé les articles
    const subscribe = await Subscribe.findOne({
      trocId: articles[0].trocId,
      userId: req.session.user._id,
    }).exec()
    if (!subscribe) throw 'Subscribe not found'

    if (subscribe.role !== 'admin' && subscribe.role !== 'cashier')
      throw 'Not allowed'

    return { articles, subscribe, isArray, userId: req.session.user._id }
  } catch (error) {
    throw error
  }
}

function beUnique(elem: any, index: number, self: any[]) {
  return self.indexOf(elem) === index
}
