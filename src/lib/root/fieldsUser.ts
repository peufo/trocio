import type { UserWithRootInfo } from 'types'
import type { FieldInteface } from 'types/magic'

export const fieldsUser: FieldInteface<UserWithRootInfo>[] = [
  {
    label: 'Name',
    key: 'name',
  },
  {
    label: 'Mail',
    key: 'mail',
  },
  {
    label: 'Mail validé',
    key: 'mailvalided',
    type: 'boolean',
  },
  {
    label: 'Condition accepté',
    key: 'acceptTerms',
    type: 'boolean',
  },
  {
    label: 'Tentative de connection',
    key: 'loginAttempts',
    type: 'number',
    hidden: true,
  },
  {
    label: 'Nombre de troc',
    key: 'trocs.count',
    type: 'number',
  },
  {
    label: "Nombre de troc d'éssai",
    key: 'trocs.countTry',
    type: 'number',
  },
  {
    label: 'Crédit',
    key: 'creditTroc',
    type: 'number',
  },
]
