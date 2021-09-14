<script lang="ts">
  import { params } from '@roxi/routify'

  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import { useInfinitApi } from '$lib/api'
  import type {
    ParamsAPI,
    ParamsArticleAPI,
    ArticleLookup,
    FieldInteface,
  } from 'types'
  import { layout } from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { getStatut } from '$lib/utils'
  import { faDotCircle } from '@fortawesome/free-solid-svg-icons'

  let searchValue = ''

  $: query = useInfinitApi<ParamsArticleAPI, ArticleLookup[]>([
    'articles',
    {
      troc: $params.trocId,
      or_search_name: searchValue,
      or_search_ref: searchValue,
    },
  ])
  $: articles = $query.data ? $query.data.pages.flat() : []

  const statutFiltersOptions: FieldInteface['selectOptions'] = [
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

  const sortOptions = [
    { queryValue: '', label: 'Non trié', icon: '<i class="fas fa-bars"></i>' },
    {
      queryValue: '1',
      label: 'Croissant',
      icon: '<i class="fas fa-sort-amount-down-alt"></i>',
    },
    {
      queryValue: '-1',
      label: 'Décroissant',
      icon: '<i class="fas fa-sort-amount-down"></i>',
    },
  ]

  let fields: FieldInteface<ArticleLookup>[] = [
    {
      label: '#',
      checked: true,
      typeMenu: 'search',
      getValue: 'ref',
      cellWidth: 50,
      disabled: true,
    },
    {
      label: 'Désignation',
      checked: true,
      typeMenu: 'search',
      getValue: 'name',
      cellWidth: 300,
      disabled: true,
    },
    {
      label: 'Statut',
      checked: true,
      typeMenu: 'select',
      queryKey: 'statut',
      getValue: getStatut,
      cellWidth: 90,
      selectOptions: statutFiltersOptions,
    },
    {
      label: 'Création',
      checked: false,
      typeMenu: 'sort',
      getValue: 'createdAt',
      format: 'date',
      cellWidth: 170,
    },
    {
      label: 'Fournisseur',
      checked: true,
      typeMenu: 'user',
      getValue: ({ provider }) => provider?.name,
      cellWidth: 70,
    },
    {
      label: 'Validation',
      checked: false,
      typeMenu: 'sort',
      getValue: 'valided',
      format: 'date',
      cellWidth: 170,
    },
    {
      label: 'Validateur',
      checked: false,
      typeMenu: 'user',
      getValue: ({ validator }) => validator?.name,
      cellWidth: 50,
    },
    {
      label: 'Vente',
      checked: false,
      typeMenu: 'sort',
      getValue: 'sold',
      format: 'date',
      cellWidth: 170,
    },
    {
      label: 'Récupération',
      checked: false,
      typeMenu: 'sort',
      getValue: 'recover',
      format: 'date',
      cellWidth: 170,
    },
    {
      label: 'Caissier',
      checked: false,
      typeMenu: 'user',
      getValue: ({ seller }) => seller?.name,
      cellWidth: 50,
    },
    {
      label: 'Client',
      checked: false,
      typeMenu: 'user',
      getValue: ({ buyer }) => buyer?.name,
      cellWidth: 50,
    },
    {
      label: 'Frais',
      checked: false,
      typeMenu: 'sort',
      getValue: 'fee',
      format: 'curency',
      cellWidth: 50,
    },
    {
      label: 'Marge',
      checked: false,
      typeMenu: 'sort',
      getValue: 'margin',
      format: 'curency',
      cellWidth: 50,
    },
    {
      label: 'Prix',
      checked: true,
      typeMenu: 'sort',
      getValue: 'price',
      format: 'curency',
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
    style="max-height: {$layout.mainHeight - 94}px;"
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
    <tbody>
      {#each articles as article}
        <tr>
          {#each fields.filter((f) => f.checked) as field}
            <td>
              {(typeof field.getValue === 'string'
                ? article[field.getValue]
                : field.getValue(article)) || ''}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </MagicTable>
</div>
