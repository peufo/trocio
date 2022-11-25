import { faDotCircle } from '@fortawesome/free-solid-svg-icons'
import type {
  Article,
  ArticleWithState,
  ArticleLookup,
  FieldInteface,
  SelectOption,
  SubscribeLookup,
} from 'types'
import { getStateLabel } from '$lib/utils'

export function getFields(): FieldInteface<ArticleWithState>[] {
  return [
    {
      label: '#',
      queryKey: 'ref',
      cellWidth: 50,
      disabled: true,
    },
    {
      label: 'Désignation',
      queryKey: 'name',
      cellWidth: 300,
      disabled: true,
    },
    {
      label: 'Statut',

      type: 'enum',
      queryKey: 'state',
      getValue: getStateLabel,
      cellWidth: 90,
      enumOptions: stateEnumOptions,
    },
    {
      label: 'Création',
      hidden: true,
      queryKey: 'createdAt',
      type: 'date',
      cellWidth: 170,
    },

    {
      label: 'Validation',
      hidden: true,
      queryKey: 'valided',
      type: 'date',
      cellWidth: 170,
    },

    {
      label: 'Vente',
      hidden: true,
      queryKey: 'sold',
      type: 'date',
      cellWidth: 170,
    },
    {
      label: 'Récupération',
      hidden: true,
      queryKey: 'recover',
      type: 'date',
      cellWidth: 170,
    },
    {
      label: 'Frais',

      queryKey: 'fee',
      type: 'currency',
      cellWidth: 50,
    },
    {
      label: 'Marge',

      queryKey: 'margin',
      type: 'currency',
      cellWidth: 50,
    },
    {
      label: 'Prix',

      queryKey: 'price',
      type: 'currency',
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
): FieldInteface<ArticleWithState & ArticleLookup>[] {
  return [
    ...getFields(),
    {
      label: 'Fournisseur',

      queryKey: 'providerSubId',
      getValue: (art) => art?.provider?.name || art?.providerSub?.name,
      cellWidth: 70,
      type: 'select',
      selectOption: selectOptionUser(trocId),
    },
    {
      label: 'Validateur',
      hidden: true,
      queryKey: 'validatorSubId',
      type: 'select',
      getValue: (art) => art?.validator?.name,
      cellWidth: 50,
      selectOption: selectOptionUser(trocId),
    },
    {
      label: 'Caissier',
      hidden: true,
      queryKey: 'sellerSubId',
      type: 'select',
      getValue: (art) => art?.seller?.name,
      cellWidth: 50,
      selectOption: selectOptionUser(trocId),
    },
    {
      label: 'Client',
      hidden: true,
      queryKey: 'buyerSubId',
      type: 'select',
      getValue: (art) => art.buyer?.name,
      cellWidth: 50,
      selectOption: selectOptionUser(trocId),
    },
  ]
}

const stateEnumOptions: FieldInteface<Article>['enumOptions'] = [
  { value: null, label: 'Tous' },
  {
    value: 'proposed',
    label: 'Proposé',
    icon: faDotCircle,
    iconStyle: 'color: rgb(158 158 158);',
  },
  {
    value: 'valided',
    label: 'Validé',
    icon: faDotCircle,
    iconStyle: 'color: rgb(33 150 243);',
  },
  {
    value: 'refused',
    label: 'Refusé',
    icon: faDotCircle,
    iconStyle: 'color: rgb(244 67 54);',
  },
  {
    value: 'sold',
    label: 'Vendu',
    icon: faDotCircle,
    iconStyle: 'color: rgb(76 175 80);',
  },
  {
    value: 'recover',
    label: 'Récupéré',
    icon: faDotCircle,
    iconStyle: 'color: rgb(255 152 0);',
  },
]
