<script lang="ts">
  import { params } from '@roxi/routify'
  import { useApi, useInfinitApi } from '$lib/api'
  import MagicTable from '$lib/util/MagicTable.svelte'

  import type { SubscribeLookup } from 'types'
  import layout from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'

  let searchValueDebounced = ''

  interface QueryParams {
    trocId: string
    q?: string
  }

  $: query = useInfinitApi<QueryParams, SubscribeLookup[]>([
    'subscribes',
    { trocId: $params.trocId, q: searchValueDebounced },
  ])
  $: rows = $query.data ? $query.data.pages.flat() : []
</script>

<div class="container">
  <h6 class="mb-5">Gestion des participants</h6>
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
            placeholder="Chercher un participant"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          <td>
            {row.user.name}
          </td>
          <td>
            {row.user.mail}
          </td>
        </tr>
      {/each}
    </tbody>
  </MagicTable>
</div>
