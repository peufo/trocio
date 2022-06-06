export * from './api'
export * from './user'
export * from './troc'
export * from './article'
export * from './subscribe'
export * from './payment'
export * from './params'
export * from './magic'
export * from './message'
export * from './option'
export * from './util'

/*
export declare function createEventDispatcher<T>(
  type: string
): (detail?: T) => void

*/
// Utils
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never
