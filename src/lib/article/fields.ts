import { faDotCircle } from '@fortawesome/free-solid-svg-icons'
import type {
  Article,
  ArticleLookup,
  FieldInteface,
  ISubscribe,
  SelectOption,
  SubscribeLookup,
  User,
} from 'types'
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

function selectOptionUser(trocId: string): SelectOption {
  return {
    path: 'subscribes',
    searchKey: 'q',
    queryParams: { trocId },
    getValue: (sub: SubscribeLookup) => sub.user?.name || sub.name,
    getValue2: (sub: SubscribeLookup) => sub.user?.mail || '',
    getKey: (sub: SubscribeLookup) => sub._id || '',
  }
}

/**
 * Retourne les champs complet
 */
export function getFieldsLookup(
  trocId: string
): FieldInteface<Article & ArticleLookup>[] {
  return [
    ...getFields(),
    {
      label: 'Fournisseur',
      visible: true,
      queryKey: 'providerSubId',
      getValue: (art) => art?.provider?.name || art?.providerSub?.name,
      cellWidth: 70,
      format: 'select',
      selectOption: selectOptionUser(trocId),
    },
    {
      label: 'Validateur',
      visible: false,
      queryKey: 'validatorSubId',
      format: 'select',
      getValue: ({ validator }) => validator?.name,
      cellWidth: 50,
      selectOption: selectOptionUser(trocId),
    },
    {
      label: 'Caissier',
      visible: false,
      queryKey: 'sellerSubId',
      format: 'select',
      getValue: ({ seller }) => seller?.name,
      cellWidth: 50,
      selectOption: selectOptionUser(trocId),
    },
    {
      label: 'Client',
      visible: false,
      queryKey: 'buyerSubId',
      format: 'select',
      getValue: ({ buyer }) => buyer?.name,
      cellWidth: 50,
      selectOption: selectOptionUser(trocId),
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
