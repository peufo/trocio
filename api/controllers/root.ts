import { exec } from 'child_process'

import config from '../../config'

import Article from '../models/article'
import { getMargin } from './article_utils'

const { TROCIO_DB, TROCIO_BACKUP } = config

/**
 * Fait un dump de la DB
 */
async function backup() {
  return new Promise((resolve, reject) => {
    const TROCIO_DB_NAME = TROCIO_DB.split('/').slice(-1)

    const backupCommand = `mongodump -d ${TROCIO_DB_NAME} -o ${TROCIO_BACKUP}/${TROCIO_DB_NAME}-${new Date()
      .toISOString()
      .replace(/:|\./g, '-')}`

    exec(backupCommand, (error, stdout, stderr) => {
      if (error) reject(error)
      console.log(stdout)
      console.log(stderr)
      resolve(null)
    })
  })
}

function handleError(error: any, label = 'MIGRATION FAILED') {
  console.log('---------------------------------------------')
  console.log(`------------  ${label} --------------`)
  console.log('---------------------------------------------')
  console.log('')
  console.error(error)
  throw error
}

/**
 * Recalcule les marges sur tout les articles
 * Nécéssaire suite à l'erreur d'utilisation des mauvais tarifs lors de l'achats d'un groupe d'articles
 */
export async function cleanUpArticlesMargin() {
  try {
    await backup()

    const soldArticles = await Article.find({
      sold: { $exists: true },
    })
    await Promise.all(
      soldArticles.map(async (art) => {
        art.margin = await getMargin(art)
        return art.save()
      })
    )

    console.log(`${soldArticles.length} article margin computed`)
    return
  } catch (error) {
    handleError(error)
  }
}
