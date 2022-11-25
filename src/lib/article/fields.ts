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

      format: 'enum',
      queryKey: 'state',
      getValue: getStateLabel,
      cellWidth: 90,
      enumOptions: stateEnumOptions,
    },
    {
      label: 'Création',
      hidden: true,
      queryKey: 'createdAt',
      format: 'date',
      cellWidth: 170,
    },

    {
      label: 'Validation',
      hidden: true,
      queryKey: 'valided',
      format: 'date',
      cellWidth: 170,
    },

    {
      label: 'Vente',
      hidden: true,
      queryKey: 'sold',
      format: 'date',
      cellWidth: 170,
    },
    {
      label: 'Récupération',
      hidden: true,
      queryKey: 'recover',
      format: 'date',
      cellWidth: 170,
    },
    {
      label: 'Frais',

      queryKey: 'fee',
      format: 'currency',
      cellWidth: 50,
    },
    {
      label: 'Marge',

      queryKey: 'margin',
      format: 'currency',
      cellWidth: 50,
    },
    {
      label: 'Prix',

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
): FieldInteface<ArticleWithState & ArticleLookup>[] {
  return [
    ...getFields(),
    {
      label: 'Fournisseur',

      queryKey: 'providerSubId',
      getValue: (art) => art?.provider?.name || art?.providerSub?.name,
      cellWidth: 70,
      format: 'select',
      selectOption: selectOptionUser(trocId),
    },
    {
      label: 'Validateur',
      hidden: true,
      queryKey: 'validatorSubId',
      format: 'select',
      getValue: (art) => art?.validator?.name,
      cellWidth: 50,
      selectOption: selectOptionUser(trocId),
    },
    {
      label: 'Caissier',
      hidden: true,
      queryKey: 'sellerSubId',
      format: 'select',
      getValue: (art) => art?.seller?.name,
      cellWidth: 50,
      selectOption: selectOptionUser(trocId),
    },
    {
      label: 'Client',
      hidden: true,
      queryKey: 'buyerSubId',
      format: 'select',
      getValue: (art) => art.buyer?.name,
      cellWidth: 50,
      selectOption: selectOptionUser(trocId),
    },
  ]
}

const stateEnumOptions: FieldInteface<Article>['enumOptions'] = [
  { key: null, label: 'Tous' },
  {
    key: 'proposed',
    label: 'Proposé',
    icon: faDotCircle,
    iconStyle: 'color: rgb(158 158 158);',
  },
  {
    key: 'valided',
    label: 'Validé',
    icon: faDotCircle,
    iconStyle: 'color: rgb(33 150 243);',
  },
  {
    key: 'refused',
    label: 'Refusé',
    icon: faDotCircle,
    iconStyle: 'color: rgb(244 67 54);',
  },
  {
    key: 'sold',
    label: 'Vendu',
    icon: faDotCircle,
    iconStyle: 'color: rgb(76 175 80);',
  },
  {
    key: 'recover',
    label: 'Récupéré',
    icon: faDotCircle,
    iconStyle: 'color: rgb(255 152 0);',
  },
]
