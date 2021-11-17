import mongoose, { FilterQuery } from 'mongoose'
const { ObjectId } = mongoose.Types

/**
 * Traite les paramètre dynamiquement suivant des règles prédéfini
 * @returns match
 */
export function dynamicQuery(
  requestQuery: object,
  ignore?: string | string[]
): { match: FilterQuery<any>; sort: object } {
  let match = { $or: [], $and: [] }
  let sort = {}
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

    // add matchSearch
    if (key.startsWith(QUERY_SEARCH)) {
      match.$and.push({
        [key.replace(QUERY_SEARCH, '')]: new RegExp(requestQuery[key], 'i'),
      })

      // add matchOrSearch
    } else if (key.startsWith(QUERY_OR_SEARCH)) {
      match.$or.push({
        [key.replace(QUERY_OR_SEARCH, '')]: new RegExp(requestQuery[key], 'i'),
      })

      // add match exact (work with ObjectId)
    } else if (key.startsWith(QUERY_EXACT)) {
      if (mongoose.isValidObjectId(requestQuery[key]))
        match.$and.push({
          [key.replace(QUERY_EXACT, '')]: new ObjectId(requestQuery[key]),
        })
      else
        match.$and.push({ [key.replace(QUERY_EXACT, '')]: requestQuery[key] })

      // add not match exact (work with ObjectId)
    } else if (key.startsWith(QUERY_NE_EXACT)) {
      if (mongoose.isValidObjectId(requestQuery[key]))
        match.$and.push({
          [key.replace(QUERY_NE_EXACT, '')]: {
            $ne: new ObjectId(requestQuery[key]),
          },
        })
      else
        match.$and.push({
          [key.replace(QUERY_NE_EXACT, '')]: { $ne: requestQuery[key] },
        })

      // Number and Date test
    } else if (
      !isNaN(requestQuery[key]) ||
      !isNaN(new Date(requestQuery[key]).getTime())
    ) {
      const value = requestQuery[key]

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
