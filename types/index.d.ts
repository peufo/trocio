export { BaseResponse, ResponseNotifyOptions } from './api'
export { User } from './user'
export { Troc, TrocLookup, TrocUserResume } from './troc'
export { Article, ArticleCreate } from './article'

export declare function createEventDispatcher<T>(
  type: string
): (detail?: T) => void
