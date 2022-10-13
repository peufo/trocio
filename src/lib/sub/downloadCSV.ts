import { api } from '$lib/api'
import notify from '$lib/notify'

export default {
  proposed,
  purchases,
  payments,
}

export async function proposed(subscribeId: string) {
  try {
    const articles = await api('/api/articles', {
      params: {
        exact_providerSubId: subscribeId,
        limit: 10_000,
      },
    })

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
