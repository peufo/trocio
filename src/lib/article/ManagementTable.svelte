<script lang="ts">
  import { onMount } from 'svelte'
  import { params } from '@roxi/routify'

  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import { useInfinitApi } from '$lib/api'
  import type { ParamsArticleAPI, ArticleLookup } from 'types'
  import { layout } from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { troc } from '$lib/troc/store'
  import { getFieldsLookup } from '$lib/article/fields'

  let searchValue = ''

  let fields = getFieldsLookup()

  $: query = useInfinitApi<ParamsArticleAPI, ArticleLookup[]>([
    'articles',
    {
      trocId: $params.trocId,
      or_search_name: searchValue,
      or_search_ref: searchValue,
      ...$params,
    },
  ])
  $: articles = $query.data ? $query.data.pages.flat() : []
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
