export interface Option {
  name: OptionNameEnum
  value: string
  description: string
  createdAt: Date
  updatedAt: Date
}

export type OptionNameEnum = 'FREE_TROC'
