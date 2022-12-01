import { faDotCircle } from '@fortawesome/free-solid-svg-icons'
import type {
  Article,
  ArticleWithState,
  ArticleLookup,
  SubscribeLookup,
} from 'types'
import type { FieldInteface, SelectAsync } from 'types/magic'
import { getStateLabel } from '$lib/utils'

export function getFields(): FieldInteface<ArticleWithState>[] {
  return [
    {
      label: '#',
      key: 'ref',
      cellWidth: 50,
      disabled: true,
    },
    {
      label: 'Désignation',
      key: 'name',
      cellWidth: 300,
      disabled: true,
    },
    {
      label: 'Statut',
      type: 'select',
      key: 'state',
      getValue: getStateLabel,
      cellWidth: 90,
      options: stateEnumOptions,
    },
    {
      label: 'Création',
      hidden: true,
      key: 'createdAt',
      type: 'date',
      cellWidth: 170,
    },
    {
      label: 'Validation',
      hidden: true,
      key: 'valided',
      type: 'date',
      cellWidth: 170,
    },
    {
      label: 'Vente',
      hidden: true,
      key: 'sold',
      type: 'date',
      cellWidth: 170,
    },
    {
      label: 'Récupération',
      hidden: true,
      key: 'recover',
      type: 'date',
      cellWidth: 170,
    },
    {
      label: 'Frais',
      key: 'fee',
      type: 'currency',
      cellWidth: 50,
    },
    {
      label: 'Marge',
      key: 'margin',
      type: 'currency',
      cellWidth: 50,
    },
    {
      label: 'Prix',
      key: 'price',
      type: 'currency',
      cellWidth: 50,
    },
  ]
}

function selectAsyncUser(trocId: string): SelectAsync {
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

      key: 'providerSubId',
      getValue: (art) => art?.provider?.name || art?.providerSub?.name,
      cellWidth: 70,
      type: 'selectAsync',
      selectAsync: selectAsyncUser(trocId),
    },
    {
      label: 'Validateur',
      hidden: true,
      key: 'validatorSubId',
      type: 'selectAsync',
      getValue: (art) => art?.validator?.name,
      cellWidth: 50,
      selectAsync: selectAsyncUser(trocId),
    },
    {
      label: 'Caissier',
      hidden: true,
      key: 'sellerSubId',
      type: 'selectAsync',
      getValue: (art) => art?.seller?.name,
      cellWidth: 50,
      selectAsync: selectAsyncUser(trocId),
    },
    {
      label: 'Client',
      hidden: true,
      key: 'buyerSubId',
      type: 'selectAsync',
      getValue: (art) => art.buyer?.name,
      cellWidth: 50,
      selectAsync: selectAsyncUser(trocId),
    },
  ]
}

const stateEnumOptions: FieldInteface<Article>['options'] = [
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
