<script lang="ts">
  import { params } from '@roxi/routify'

  import { getFields } from '$lib/user/fields'
  import { useInfinitApi } from '$lib/api'
  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import type { SubscribeLookup, ParamsSubscribeAPI } from 'types'
  import layout, { isMobile } from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { troc } from '$lib/troc/store'
  import SubscribeMenu from '$lib/user/SubscribeMenu.svelte'

  let subscribeMenu: SubscribeMenu

  let searchValue = ''
  let queryParams = {}

  let fields = getFields($troc)

  $: query = useInfinitApi<ParamsSubscribeAPI, SubscribeLookup[]>([
    'subscribes',
    {
      exact_trocId: $params.trocId,
      q: searchValue,
      includResum: true,
      ...queryParams,
    },
  ])
</script>

<SubscribeMenu bind:this={subscribeMenu} />

<div class="container">
  <div class="d-flex align-center mb-2">
    <h6>{$isMobile ? 'Participants' : 'Gestion des participants'}</h6>
    <div class="flex-grow-1" />
    <MagicTableFieldSelect bind:fields />
  </div>

  <MagicTable
    {query}
    class="simple-card"
    style="
      min-height: 400px;
      max-height: {$layout.mainHeight - ($troc.is_try ? 124 : 76)}px;
    "
  >
    <thead>
      <tr>
        <th colspan="2" style="padding-left: 0px;">
          <SearchTextField bind:search={searchValue} flat solo dense />
        </th>

        <MagicTableHeaders {fields} bind:queryParams />
      </tr>
    </thead>

    <MagicTableBody
      {fields}
      {query}
      currency={$troc.currency}
      on:click={({ detail }) =>
        subscribeMenu.open(detail.clickEvent, detail.item)}
    />
  </MagicTable>
</div>
