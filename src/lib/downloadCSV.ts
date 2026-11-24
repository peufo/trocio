import { api } from '$lib/api'
import notify from '$lib/notify'
import { getState } from '$lib/utils'
import { getFields } from '$lib/user/fields'
import { getPaymentFields } from '$lib/payment/fields'
import type { TrocLookup, ParamsPaymentAPI } from 'types'
import objectPath from 'object-path'
import type { FieldInteface } from 'types/magic'

export default {
  proposed,
  purchases,
  payments,
  trocPayments,
  subscribes,
}

export async function proposed(subscribeId: string) {
  try {
    const articles = await api('/api/articles', {
      params: {
        exact_providerSubId: subscribeId,
        limit: 10_000,
      },
    })
    articles.forEach((art) => (art.status = getState(art)))

    downloadFile('Trocio-articles-proposed.txt', arrToCSV(articles))
    notify.success('Fichier téléchargé')
  } catch (error) {
    notify.error(error)
  }
}

export async function purchases(subscribeId: string) {
  try {
    const articles = await api('/api/articles', {
      params: {
        exact_buyerSubId: subscribeId,
        limit: 10_000,
      },
    })
    downloadFile('Trocio-articles-purchases.txt', arrToCSV(articles))
    notify.success('Fichier téléchargé')
  } catch (error) {
    notify.error(error)
  }
}

export async function payments(subscribeId: string) {
  try {
    const payments = await api('/api/payments', {
      params: { subscribeId, limit: 10_000 },
    })
    downloadFile('Trocio-payments.txt', arrToCSV(payments))
    notify.success('Fichier téléchargé')
  } catch (error) {
    notify.error(error)
  }
}

export async function subscribes(troc: TrocLookup) {
  try {
    const subscribes = await api('/api/subscribes', {
      params: { trocId: troc._id, limit: 10_000, includResum: true },
    })

    downloadFile('Trocio-subscribes.txt', fieldsToTSV(subscribes, getFields(troc)))
    notify.success('Fichier téléchargé')
  } catch (error) {
    notify.error(error)
  }
}

/**
 * Exporte tous les paiements d'un troc correspondant aux filtres
 */
export async function trocPayments(filterParams: ParamsPaymentAPI) {
  try {
    const payments = await api('/api/payments', {
      params: { ...filterParams, limit: 10_000 },
    })
    const fields = getPaymentFields(filterParams.exact_trocId as string)

    downloadFile('Trocio-payments.txt', fieldsToTSV(payments, fields))
    notify.success('Fichier téléchargé')
  } catch {
    // Erreur déjà notifiée par api() (dont le dépassement du plafond)
  }
}

/**
 * Convertit des items en texte tabulé, une colonne par champ
 */
function fieldsToTSV(items: any[], fields: FieldInteface<any>[]): string {
  function getValue(item: any, field: FieldInteface<any>): string | number {
    const value =
      typeof field.getValue === 'function'
        ? field.getValue(item)
        : objectPath.get(item, field.key)
    if (field.type === 'date' && value) return new Date(value).toLocaleString()
    if (typeof value === 'number') return value.toLocaleString()
    // Les tabulations et retours à la ligne casseraient les colonnes/lignes
    if (typeof value === 'string') return value.replace(/[\t\r\n]+/g, ' ')
    return value
  }
  const headers = fields.map((field) => field.label).join('\t')
  const rows = items.map((item) =>
    fields.map((field) => getValue(item, field)).join('\t')
  )
  return [headers, ...rows].join('\r\n')
}

function downloadFile(title: string, content: string) {
  const blob = new Blob([content], { type: 'application/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = title
  document.body.append(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function arrToCSV(arr: object[]): string {
  const ignoreKeys = [/_id/, /__v/, /Id$/, /Sub$/, /giveback/]

  const keys = new Set<string>()
  for (const item of arr) {
    for (const key in item) {
      keys.add(key)
    }
  }

  let _keys = [...keys.values()]
  _keys.forEach((key) => {
    for (const ignoreKey of ignoreKeys) {
      if (key.match(ignoreKey)) keys.delete(key)
    }
  })

  const lines: string[] = [[...keys.values()].join('\t')]
  for (const item of arr) {
    const cells: string[] = []
    keys.forEach((key) => {
      const value = item[key] || ''
      if (typeof value === 'string') cells.push(value.replace('\n', ' '))
      else if (typeof value === 'number') cells.push(value.toString())
      else if (typeof value === 'object') cells.push(value.name as string)
    })
    lines.push(cells.join('\t'))
  }
  return lines.join('\n')
}
