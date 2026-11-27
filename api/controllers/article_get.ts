import mongoose from 'mongoose'
import type { RequestHandler, Request } from 'express'

import Article from '../models/article'
import Subscribe from '../models/subscribe'
import { populateUser } from './lookup'
import { dynamicQuery } from './utils'
import { getRole } from './access'
import type { Article as IArticle } from '../../types'
import { getMatchesByState, sumOfArticles } from './article_utils'

const { ObjectId } = mongoose.Types

/**
 * Construit le match et le sort d'une recherche d'articles à partir de la query
 * Partagé par getArticles et getArticlesSelection
 */
function buildArticlesMatch(query: Request['query']) {
    const { q, exact_state, include_without_name } = query

    let { match, sort } = dynamicQuery(query, {
        ignore: 'exact_state',
        cleanupMatch: false,
    })
    if (!match.$and || !match.$or) throw Error('never')

    // add specific match
    if (!include_without_name) match.$and.push({ name: { $ne: '' } })

    if (exact_state) match.$and.push(...getMatchesByState(exact_state))

    if (q && typeof q === 'string') {
        match.$and.push({
            $or: [{ name: new RegExp(q, 'i') }, { ref: new RegExp(q, 'i') }],
        })
    }

    //remove match if is empty
    if (match.$and.length === 0) delete match.$and
    if (match.$or.length === 0) delete match.$or

    if (!Object.keys(sort).length) sort = { createdAt: 1, index: 1 }

    return { match, sort }
}

const ARTICLES_MAX = 10_000

export const getArticles: RequestHandler = async (req, res, next) => {
    try {
        const { limit = 20, skip = 0 } = req.query
        const { match, sort } = buildArticlesMatch(req.query)

        const aggregate = Article.aggregate().match(match).sort(sort)

        // Au plafond (export), on demande une ligne de plus pour détecter
        // un résultat qui serait tronqué au lieu de le couper en silence
        const reachMax = (+limit || 20) >= ARTICLES_MAX
        aggregate
            .skip(+skip || 0)
            .limit(reachMax ? ARTICLES_MAX + 1 : +limit || 20)

        lookupUsers(aggregate)
        lookupSubscribe(aggregate, 'provider')
        lookupSubscribe(aggregate, 'buyer')

        const articles = await aggregate.exec()
        if (articles.length > ARTICLES_MAX)
            throw Error(
                `public: Plus de ${ARTICLES_MAX.toLocaleString('fr')} articles correspondent aux filtres, affinez-les`
            )

        res.json(articles)
    } catch (error) {
        next(error)
    }
}

const SELECTION_MAX = 20_000

/**
 * Retourne une projection légère de tous les articles correspondant au filtre
 * Utilisé pour la sélection multiple de la table de gestion des articles
 */
export const getArticlesSelection: RequestHandler = async (req, res, next) => {
    try {
        const { exact_trocId } = req.query
        if (!exact_trocId || typeof exact_trocId !== 'string')
            throw 'exact_trocId query is required'

        const role = await getRole(exact_trocId, req.session.user?._id)
        if (role !== 'admin' && role !== 'cashier') throw 'Not allowed'

        const { skip, limit, ...query } = req.query
        const { match, sort } = buildArticlesMatch(query)

        const articles = await Article.aggregate()
            .match(match)
            .sort(sort)
            .limit(SELECTION_MAX + 1)
            .project({
                ref: 1,
                name: 1,
                price: 1,
                tagId: 1,
                valided: 1,
                refused: 1,
                sold: 1,
                recover: 1,
            })
            .exec()

        if (articles.length > SELECTION_MAX)
            throw `La sélection ne peut pas dépasser ${SELECTION_MAX} articles`

        res.json(articles)
    } catch (error) {
        next(error)
    }
}

export const getArticleImportable: RequestHandler = async (req, res, next) => {
    try {
        const { subscribeId } = req.query
        if (!mongoose.isValidObjectId(subscribeId))
            throw Error('subscribeId need to be a valid objectId')

        const subscribe = await Subscribe.findById(subscribeId)

        const trocs = await Article.aggregate([
            {
                $match: {
                    providerId: subscribe?.userId,
                    $and: [
                        {
                            $or: [
                                { isCopied: false },
                                { isCopied: { $exists: false } },
                            ],
                        },
                        {
                            $or: [
                                { recover: { $exists: true } },
                                { recover: { $exists: true } },
                            ],
                        },
                    ],
                },
            },
            {
                $group: {
                    _id: '$trocId',
                    articles_count: { $sum: 1 },
                    articles: {
                        $push: {
                            _id: '$_id',
                            name: '$name',
                            tagId: '$tagId',
                            ref: '$ref',
                            price: '$price',
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'trocs',
                    foreignField: '_id',
                    localField: '_id',
                    as: 'troc',
                },
            },
            {
                $addFields: {
                    troc: { $arrayElemAt: ['$troc', 0] },
                },
            },
            {
                $sort: {
                    'troc.schedule.0': -1,
                },
            },
        ])

        res.json(trocs)
    } catch (error) {
        next(error)
    }
}

export const getArticleCountsByState: RequestHandler = async (
    req,
    res,
    next
) => {
    try {
        const { trocId } = req.query
        if (!mongoose.isValidObjectId(trocId))
            throw Error('trocId need to be a valid objectId')

        const [counts] = await Article.aggregate([
            { $match: { trocId: new ObjectId(trocId as string) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    proposed: sumOfArticles('proposed'),
                    refused: sumOfArticles('refused'),
                    valided: sumOfArticles('valided'),
                    sold: sumOfArticles('sold'),
                    recover: sumOfArticles('recover'),
                },
            },
        ])

        // Si aucun article ne match
        const defaultCounts = {
            _id: null,
            total: 0,
            proposed: 0,
            refused: 0,
            valided: 0,
            sold: 0,
            recover: 0,
        }

        res.json(counts || defaultCounts)
    } catch (error) {
        next(error)
    }
}

/**
 * Effectue un loolkup sur les correction d'un article
 */
export const getArticleCorrection: RequestHandler = async (req, res, next) => {
    try {
        const { articleId } = req.query
        if (typeof articleId !== 'string') throw 'articleId query is required'

        const aggregate = Article.aggregate().match({
            _id: new ObjectId(articleId),
        })

        lookupCorrections(aggregate)

        const [article] = await aggregate.exec()

        res.json(article)
    } catch (error) {
        next(error)
    }
}

/**
 * Update aggregate for lookup troc from trocId
 */
export function lookupUsers(aggregate: mongoose.Aggregate<IArticle[]>): void {
    aggregate
        .lookup(populateUser('provider'))
        .lookup(populateUser('validator'))
        .lookup(populateUser('seller'))
        .lookup(populateUser('buyer'))
        .addFields({
            provider: { $arrayElemAt: ['$provider', 0] },
            validator: { $arrayElemAt: ['$validator', 0] },
            seller: { $arrayElemAt: ['$seller', 0] },
            buyer: { $arrayElemAt: ['$buyer', 0] },
        })
}

/**
 * Update aggregate for add author Name
 */
export function lookupCorrections(
    aggregate: mongoose.Aggregate<IArticle[]>
): void {
    aggregate
        .unwind('$corrections')
        .lookup(populateUser('corrections.author'))
        .addFields({
            'corrections.author': { $arrayElemAt: ['$corrections.author', 0] },
        })
        .group({
            _id: '$_id',
            corrections: {
                $push: '$corrections',
            },
        })
}

/**
 * Update aggregate for lookup subscribe of provider
 */
export function lookupSubscribe(
    aggregate: mongoose.Aggregate<IArticle[]>,
    key = 'provider'
): void {
    aggregate
        .lookup({
            from: 'subscribes',
            let: { subId: `$${key}SubId` },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $eq: ['$$subId', '$_id'],
                        },
                    },
                },
                {
                    $project: { name: 1 },
                },
            ],
            as: `${key}Sub`,
        })
        .addFields({
            [`${key}Sub`]: { $arrayElemAt: [`$${key}Sub`, 0] },
        })
}
