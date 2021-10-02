<script lang="ts">
  import { params } from '@roxi/routify'

  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import { useInfinitApi } from '$lib/api'
  import type { ParamsArticleAPI, ArticleLookup, FieldInteface } from 'types'
  import { layout } from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { getStatut } from '$lib/utils'
  import { faDotCircle } from '@fortawesome/free-solid-svg-icons'
  import { troc } from '$lib/troc/store'

  let searchValue = ''

  $: query = useInfinitApi<ParamsArticleAPI, ArticleLookup[]>([
    'articles',
    {
      troc: $params.trocId,
      or_search_name: searchValue,
      or_search_ref: searchValue,
      ...$params,
    },
  ])
  $: articles = $query.data ? $query.data.pages.flat() : []

  const statutEnumOptions: FieldInteface['enumOptions'] = [
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

  let fields: FieldInteface<ArticleLookup>[] = [
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
      label: 'Fournisseur',
      visible: true,
      format: 'string',
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
      label: 'Validation',
      visible: false,
      queryKey: 'valided',
      format: 'date',
      cellWidth: 170,
    },
    {
      label: 'Validateur',
      visible: false,
      queryKey: 'validator',
      format: 'string',
      getValue: ({ validator }) => validator?.name,
      cellWidth: 50,
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
      label: 'Caissier',
      visible: false,
      queryKey: 'seller',
      format: 'string',
      getValue: ({ seller }) => seller?.name,
      cellWidth: 50,
    },
    {
      label: 'Client',
      visible: false,
      queryKey: 'buyer',
      format: 'string',
      getValue: ({ buyer }) => buyer?.name,
      cellWidth: 50,
    },
    {
      label: 'Frais',
      visible: false,
      queryKey: 'fee',
      format: 'currency',
      cellWidth: 50,
    },
    {
      label: 'Marge',
      visible: false,
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

  /*
  .map((field) => {
    field.queryValue = ''
    field.queryLabel = ''
    field.queryIcon = ''
    if (field.typeMenu == 'sort') field.options = sortOptions
    if (field.typeMenu == 'user')
      field.queryIcon = '<i class="far fa-user"></i>'
    return field
  })
  */
</script>

<div class="container">
  <div class="d-flex align-center">
    <h6 class="mb-5">Gestion des articles</h6>
    <div class="flex-grow-1" />
    <MagicTableFieldSelect bind:fields />
  </div>

  <MagicTable
    {query}
    class="simple-card"
    style="min-height: 400px; max-height: {$layout.mainHeight - 94}px;"
  >
    <thead>
      <tr>
        <th colspan="2" style="padding-left: 0px;">
          <SearchTextField
            bind:search={searchValue}
            placeholder="Chercher un article"
          />
        </th>

        <MagicTableHeaders {fields} />
      </tr>
    </thead>

    <MagicTableBody {fields} items={articles} currency={$troc.currency} />
  </MagicTable>
</div>
