import mongoose from 'mongoose'
import type { Request } from 'express'
import createError from 'http-errors'

import Subscribe from '../models/subscribe'
import { getRole, isRootUser } from './access'

/**
 * Contrôle d'accès de GET /api/articles
 *
 * La recherche d'articles est publique (page d'un troc), mais les noms et
 * identifiants des personnes (fournisseur, validateur, caissier, client) ne
 * sont visibles que :
 * - par les admins et caissiers du troc de l'article
 * - par le participant pour ses propres articles (proposés ou achetés)
 */

/** Champs d'un article visibles par tout le monde */
const PUBLIC_FIELDS = [
  '_id',
  '__v',
  'trocId',
  'tagId',
  'isCopied',
  'index',
  'ref',
  'name',
  'price',
  'fee',
  'margin',
  'valided',
  'refused',
  'sold',
  'recover',
  'createdAt',
  'updatedAt',
]

/**
 * Champs ajoutés pour le fournisseur de l'article.
 * Les noms du validateur et du caissier (membres de l'organisation) restent
 * visibles pour l'historique de l'article, pas celui du client.
 */
const PROVIDER_FIELDS = [
  'providerId',
  'providerSubId',
  'provider',
  'providerSub',
  'validator',
  'seller',
]

/** Champs ajoutés pour l'acheteur de l'article */
const BUYER_FIELDS = ['buyerId', 'buyerSubId', 'buyer', 'buyerSub', 'seller']

/** Champs de la query qui désignent une personne */
const PEOPLE_FIELD =
  /^(provider|validator|seller|buyer)(Sub)?(Id)?$|^(corrections|giveback)(\.|$)/

const QUERY_PREFIXES = [
  'or_search_',
  'search_',
  'ne_exact_',
  'exact_',
  'sort_',
  'min_',
  'max_',
]

const STAFF_ROLES = ['admin', 'cashier']

function isStaff(role: string | null | undefined) {
  return !!role && STAFF_ROLES.includes(role)
}

function getQueryField(key: string) {
  const prefix = QUERY_PREFIXES.find((p) => key.startsWith(p))
  return prefix ? key.slice(prefix.length) : key
}

/**
 * Vérifie que les filtres portant sur des personnes sont autorisés
 * - admin/caissier du troc filtré (exact_trocId) : tout est permis
 * - sinon seuls exact_providerSubId / exact_buyerSubId sont permis, pour un
 *   abonnement de l'utilisateur ou d'un troc dont il est admin/caissier
 *   (exact_providerId / exact_buyerId : uniquement l'utilisateur lui-même)
 * @throws 403 sinon
 */
export async function authorizeArticlesQuery(req: Request): Promise<void> {
  const peopleKeys = Object.keys(req.query).filter((key) =>
    PEOPLE_FIELD.test(getQueryField(key))
  )
  if (!peopleKeys.length) return

  const userId = req.session.user?._id
  if (!userId) throw createError(403, 'Login required')
  if (isRootUser(req)) return

  const { exact_trocId } = req.query
  if (typeof exact_trocId === 'string' && mongoose.isValidObjectId(exact_trocId))
    if (isStaff(await getRole(exact_trocId, userId))) return

  for (const key of peopleKeys) {
    const value = req.query[key]
    if (typeof value !== 'string' || !mongoose.isValidObjectId(value))
      throw createError(403, 'Not allowed')

    if (key === 'exact_providerId' || key === 'exact_buyerId') {
      if (String(value) !== String(userId))
        throw createError(403, 'Not allowed')
      continue
    }

    if (key === 'exact_providerSubId' || key === 'exact_buyerSubId') {
      const subscribe = await Subscribe.findById(value, {
        userId: 1,
        trocId: 1,
      }).lean()
      if (!subscribe) throw createError(403, 'Not allowed')
      if (String(subscribe.userId) === String(userId)) continue
      if (isStaff(await getRole(String(subscribe.trocId), userId))) continue
      throw createError(403, 'Not allowed')
    }

    throw createError(403, 'Not allowed')
  }
}

/** Indique si la requête peut avoir besoin des lookups de personnes */
export function canSeePeople(req: Request): boolean {
  return !!req.session.user?._id
}

/**
 * Retire de chaque article les champs de personnes que l'utilisateur
 * n'a pas le droit de voir
 */
export async function sanitizeArticles<T extends Record<string, any>>(
  req: Request,
  articles: T[]
): Promise<Partial<T>[]> {
  if (!articles.length) return articles
  const userId = req.session.user?._id
  if (userId && isRootUser(req)) return articles

  // Abonnements de l'utilisateur aux trocs des articles retournés
  const subByTroc = new Map<string, { _id: string; role?: string }>()
  if (userId) {
    const trocIds = [...new Set(articles.map((art) => String(art.trocId)))]
    const subscribes = await Subscribe.find(
      { userId, trocId: { $in: trocIds } },
      { trocId: 1, role: 1 }
    ).lean()
    for (const sub of subscribes)
      subByTroc.set(String(sub.trocId), {
        _id: String(sub._id),
        role: sub.role,
      })
  }

  return articles.map((article) => {
    const sub = subByTroc.get(String(article.trocId))
    if (isStaff(sub?.role)) return article

    const fields = new Set(PUBLIC_FIELDS)
    if (userId) {
      const isProvider =
        String(article.providerId) === String(userId) ||
        (!!sub && String(article.providerSubId) === sub._id)
      const isBuyer =
        (!!article.buyerId && String(article.buyerId) === String(userId)) ||
        (!!sub && String(article.buyerSubId) === sub._id)

      if (isProvider) PROVIDER_FIELDS.forEach((f) => fields.add(f))
      if (isBuyer) BUYER_FIELDS.forEach((f) => fields.add(f))
    }

    const sanitized: Partial<T> = {}
    for (const key of fields)
      if (key in article) sanitized[key as keyof T] = article[key]
    return sanitized
  })
}
