import mongoose, { FilterQuery } from 'mongoose'
const { ObjectId } = mongoose.Types

/**
 * Traite les paramètre dynamiquement suivant des règles prédéfini
 */
export function dynamicQuery(
  requestQuery: object,
  ignore?: string | string[]
): { match: FilterQuery<any>; sort: object } {
  const match: { $or: FilterQuery<any>[]; $and: FilterQuery<any>[] } = {
    $or: [],
    $and: [],
  }
  let sort: object = {}
  const QUERY_SEARCH = 'search_'
  const QUERY_OR_SEARCH = 'or_search_'
  const QUERY_SORT = 'sort_'
  const QUERY_EXACT = 'exact_'
  const QUERY_NE_EXACT = 'ne_exact_'
  const QUERY_FILTER_MIN = 'min_'
  const QUERY_FILTER_MAX = 'max_'

  const ignoreIsArray = Array.isArray(ignore)

  // Dynamic query
  for (let key in requestQuery) {
    // prevent key already managed
    if (ignoreIsArray ? ignore.includes(key) : ignore === key) continue
    let value = requestQuery[key]

    // Seul moyen rapide que j'ai trouver pour les booleans
    // Un peu dangereux si une string resemble à 'true'... ca ira 👌
    if (value === 'true') value = true
    if (value === 'false') value = false

    // add matchSearch
    if (key.startsWith(QUERY_SEARCH)) {
      match.$and.push({
        [key.replace(QUERY_SEARCH, '')]: new RegExp(value, 'i'),
      })

      // add matchOrSearch
    } else if (key.startsWith(QUERY_OR_SEARCH)) {
      match.$or.push({
        [key.replace(QUERY_OR_SEARCH, '')]: new RegExp(value, 'i'),
      })

      // add match exact (work with ObjectId)
    } else if (key.startsWith(QUERY_EXACT)) {
      if (mongoose.isValidObjectId(value)) {
        match.$and.push({
          [key.replace(QUERY_EXACT, '')]: new ObjectId(value),
        })
      } else {
        match.$and.push({ [key.replace(QUERY_EXACT, '')]: value })
      }

      // add not match exact (work with ObjectId)
    } else if (key.startsWith(QUERY_NE_EXACT)) {
      if (mongoose.isValidObjectId(value))
        match.$and.push({
          [key.replace(QUERY_NE_EXACT, '')]: {
            $ne: new ObjectId(value),
          },
        })
      else
        match.$and.push({
          [key.replace(QUERY_NE_EXACT, '')]: { $ne: value },
        })

      // Number and Date test
    } else if (!isNaN(value) || !isNaN(new Date(value).getTime())) {
      // add sort
      if (key.startsWith(QUERY_SORT)) {
        sort[key.replace(QUERY_SORT, '')] = +value

        // add filter min
      } else if (key.startsWith(QUERY_FILTER_MIN)) {
        match.$and.push({
          [key.replace(QUERY_FILTER_MIN, '')]: { $gte: value },
        })

        // add filter max
      } else if (key.startsWith(QUERY_FILTER_MAX)) {
        match.$and.push({
          [key.replace(QUERY_FILTER_MAX, '')]: { $lte: value },
        })
      }
    }
  }

  return { match, sort }
}
