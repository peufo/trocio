import { faDotCircle } from '@fortawesome/free-solid-svg-icons'
import type { Article, ArticleLookup, FieldInteface } from 'types'
import { getStatut } from '$lib/utils'

export function getFields(): FieldInteface<Article>[] {
  return [
    {
      label: '#',
      visible: true,
      queryKey: 'ref',
      format: 'string',
      cellWidth: 50,
      disabled: true,
    },
    {
      label: 'Désignation',
      visible: true,
      queryKey: 'name',
      format: 'string',
      cellWidth: 300,
      disabled: true,
    },
    {
      label: 'Statut',
      visible: true,
      format: 'enum',
      queryKey: 'statut',
      getValue: getStatut,
      cellWidth: 90,
      enumOptions: statutEnumOptions,
    },
    {
      label: 'Création',
      visible: false,
      queryKey: 'createdAt',
      format: 'date',
      cellWidth: 170,
    },

    {
      label: 'Validation',
      visible: false,
      queryKey: 'valided',
      format: 'date',
      cellWidth: 170,
    },

    {
      label: 'Vente',
      visible: false,
      queryKey: 'sold',
      format: 'date',
      cellWidth: 170,
    },
    {
      label: 'Récupération',
      visible: false,
      queryKey: 'recover',
      format: 'date',
      cellWidth: 170,
    },
    {
      label: 'Frais',
      visible: true,
      queryKey: 'fee',
      format: 'currency',
      cellWidth: 50,
    },
    {
      label: 'Marge',
      visible: true,
      queryKey: 'margin',
      format: 'currency',
      cellWidth: 50,
    },
    {
      label: 'Prix',
      visible: true,
      queryKey: 'price',
      format: 'currency',
      cellWidth: 50,
    },
  ]
}

export function getFieldsLookup(): FieldInteface<Article & ArticleLookup>[] {
  return [
    ...getFields(),
    {
      label: 'Fournisseur',
      visible: true,
      format: 'user',
      queryKey: 'provider',
      getValue: ({ provider }) => provider?.name,
      cellWidth: 70,
      /**
       TODO: NE FONCTIONNE PAS BIEN
       format: 'select',
       selectOption: {
         path: '/users/search',
         searchKey: 'q',
         getValue2: (item) => item.mail,
       },

      */
    },
    {
      label: 'Validateur',
      visible: false,
      queryKey: 'validator',
      format: 'user',
      getValue: ({ validator }) => validator?.name,
      cellWidth: 50,
    },
    {
      label: 'Caissier',
      visible: false,
      queryKey: 'seller',
      format: 'user',
      getValue: ({ seller }) => seller?.name,
      cellWidth: 50,
    },
    {
      label: 'Client',
      visible: false,
      queryKey: 'buyer',
      format: 'user',
      getValue: ({ buyer }) => buyer?.name,
      cellWidth: 50,
    },
  ]
}

const statutEnumOptions: FieldInteface<Article>['enumOptions'] = [
  { queryValue: '', label: 'Tous' },
  {
    queryValue: 'proposed',
    label: 'Proposé',
    icon: faDotCircle,
    iconStyle: 'color: rgb(158 158 158);',
  },
  {
    queryValue: 'valided',
    label: 'Validé',
    icon: faDotCircle,
    iconStyle: 'color: rgb(33 150 243);',
  },
  {
    queryValue: 'refused',
    label: 'Refusé',
    icon: faDotCircle,
    iconStyle: 'color: rgb(244 67 54);',
  },
  {
    queryValue: 'sold',
    label: 'Vendu',
    icon: faDotCircle,
    iconStyle: 'color: rgb(76 175 80);',
  },
  {
    queryValue: 'recover',
    label: 'Récupéré',
    icon: faDotCircle,
    iconStyle: 'color: rgb(255 152 0);',
  },
]
