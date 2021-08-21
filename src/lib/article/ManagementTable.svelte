<script lang="ts">
  import { leftover, params } from '@roxi/routify'
  import { Button } from 'svelte-materialify'
  import debounce from 'debounce'

  import MagicTable from '$lib/util/MagicTable.svelte'
  import { useInfinitApi } from '$lib/api'
  import type { ParamsAPI, ArticleLookup, FieldInteface } from 'types'
  import { layout } from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'

  let searchValueDebounced = ''

  $: query = useInfinitApi<ParamsAPI, ArticleLookup[]>([
    'articles',
    {
      trocId: $params.trocId,
      or_search_name: searchValueDebounced,
      or_search_ref: searchValueDebounced,
    },
  ])
  $: articles = $query.data ? $query.data.pages.flat() : []

  const handleSearchSubscriber = debounce((event: any) => {
    searchValueDebounced = event.target.value
  }, 200)

  const statutFiltersOptions = [
    { queryValue: '', label: 'Tous', icon: '' },
    {
      queryValue: 'proposed',
      label: 'Proposé',
      icon: '<i class="fas fa-dot-circle w3-text-light-grey"></i>',
    },
    {
      queryValue: 'valided',
      label: 'Validé',
      icon: '<i class="fas fa-dot-circle w3-text-blue"></i>',
    },
    {
      queryValue: 'refused',
      label: 'Refusé',
      icon: '<i class="fas fa-dot-circle w3-text-red"></i>',
    },
    {
      queryValue: 'sold',
      label: 'Vendu',
      icon: '<i class="fas fa-dot-circle w3-text-green"></i>',
    },
    {
      queryValue: 'recover',
      label: 'Récupéré',
      icon: '<i class="fas fa-dot-circle w3-text-orange"></i>',
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
      dataType: 'string',
      cellWidth: 50,
      disabled: true,
    },
    {
      label: 'Désignation',
      checked: true,
      typeMenu: 'search',
      getValue: 'name',
      dataType: 'string',
      cellWidth: 300,
      disabled: true,
    },
    {
      label: 'Statut',
      checked: true,
      typeMenu: 'filter',
      getValue: 'statut',
      dataType: 'string',
      cellWidth: 90,
      options: statutFiltersOptions,
    },
    {
      label: 'Création',
      checked: false,
      typeMenu: 'sort',
      getValue: 'createdAt',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Fournisseur',
      checked: true,
      typeMenu: 'user',
      getValue: ({ provider }) => provider?.name,
      dataType: 'string',
      cellWidth: 70,
    },
    {
      label: 'Validation',
      checked: false,
      typeMenu: 'sort',
      getValue: 'valided',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Validateur',
      checked: false,
      typeMenu: 'user',
      getValue: ({ validator }) => validator?.name,
      dataType: 'string',
      cellWidth: 50,
    },
    {
      label: 'Vente',
      checked: false,
      typeMenu: 'sort',
      getValue: 'sold',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Récupération',
      checked: false,
      typeMenu: 'sort',
      getValue: 'recover',
      dataType: 'date',
      cellWidth: 170,
    },
    {
      label: 'Caissier',
      checked: false,
      typeMenu: 'user',
      getValue: ({ seller }) => seller?.name,
      dataType: 'string',
      cellWidth: 50,
    },
    {
      label: 'Client',
      checked: false,
      typeMenu: 'user',
      getValue: ({ buyer }) => buyer?.name,
      dataType: 'string',
      cellWidth: 50,
    },
    {
      label: 'Frais',
      checked: false,
      typeMenu: 'sort',
      getValue: 'fee',
      dataType: 'number',
      cellWidth: 50,
    },
    {
      label: 'Marge',
      checked: false,
      typeMenu: 'sort',
      getValue: 'margin',
      dataType: 'number',
      cellWidth: 50,
    },
    {
      label: 'Prix',
      checked: true,
      typeMenu: 'sort',
      getValue: 'price',
      dataType: 'number',
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
            bind:search={searchValueDebounced}
            placeholder="Chercher un article"
          />
        </th>
        {#each fields.filter((f) => !f.disabled && f.checked) as field}
          <th>{field.label}</th>
        {/each}
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
