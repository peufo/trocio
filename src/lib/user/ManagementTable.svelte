<script lang="ts">
  import { params } from '@roxi/routify'
  import { useApi, useInfinitApi } from '$lib/api'
  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'

  import type { FieldInteface, SubscribeLookup } from 'types'
  import layout from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { troc } from '$lib/troc/store'

  let searchValue = ''

  interface QueryParams {
    trocId: string
    q?: string
    lookupTarif?: boolean
    computeResum?: boolean
  }

  $: query = useInfinitApi<QueryParams, SubscribeLookup[]>([
    'subscribes',
    { trocId: $params.trocId, q: searchValue, ...$params, computeResum: true },
  ])
  $: items = $query.data ? $query.data.pages.flat() : []

  let fields: FieldInteface[] = [
    {
      label: 'Nom',
      visible: true,
      disabled: true,
      queryKey: 'name',
      format: 'string',
      cellWidth: 50,
      getValue: (sub) => sub.user.name,
    },
    {
      label: 'mail',
      visible: true,
      disabled: true,
      queryKey: 'mail',
      format: 'string',
      cellWidth: 50,
      getValue: (sub) => sub.user.mail,
    },
    {
      label: 'Tarif',
      visible: true,
      queryKey: 'tarifId',
      format: 'enum',
      getValue: (sub) =>
        $troc.tarif.find((tarif) => tarif._id === sub.tarifId)?.name,
      enumOptions: [
        { queryValue: '', label: 'Tous' },
        ...$troc.tarif.map((tarif) => ({
          label: tarif.name,
          queryValue: tarif._id,
        })),
      ],
    },
    {
      label: 'Solde',
      visible: true,
      queryKey: 'balance',
      format: 'currency',
      getValue: (sub) => sub.resum?.balance,
    },
  ]
</script>

<div class="container">
  <div class="d-flex align-center">
    <h6 class="mb-5">Gestion des participants</h6>
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
            placeholder="Chercher un participant"
          />
        </th>

        <MagicTableHeaders {fields} />
      </tr>
    </thead>

    <MagicTableBody {fields} {items} currency={$troc.currency} />
  </MagicTable>
</div>
