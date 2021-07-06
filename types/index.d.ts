export * from './api'
export * from './user'
export * from './troc'
export * from './article'
export * from './subscribe'

export declare function createEventDispatcher<T>(
  type: string
): (detail?: T) => void
