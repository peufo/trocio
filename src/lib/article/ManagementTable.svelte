<script lang="ts">
  import { params } from '@roxi/routify'

  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import { useInfinitApi } from '$lib/api'
  import type { ParamsArticleAPI, ArticleLookup } from 'types'
  import { layout, isMobile } from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { troc } from '$lib/troc/store'
  import { getFieldsLookup } from '$lib/article/fields'
  import ArticleDetailDialog from '$lib/article/DetailDialog.svelte'

  let searchValue = ''
  let fields = getFieldsLookup($params.trocId)
  let articleDetailDialog: ArticleDetailDialog

  let queryParams = {}

  $: query = useInfinitApi<ParamsArticleAPI, ArticleLookup[]>([
    'articles',
    {
      exact_trocId: $params.trocId,
      or_search_name: searchValue,
      or_search_ref: searchValue,
      ...queryParams,
    },
  ])
</script>

<ArticleDetailDialog bind:this={articleDetailDialog} modeAdmin />

<div class="container">
  <div class="d-flex align-center mb-2">
    <h6>{$isMobile ? 'Articles' : 'Gestion des articles'}</h6>
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
      on:click={(event) => {
        const { clickEvent, item } = event.detail
        articleDetailDialog.open(clickEvent, item)
      }}
    />
  </MagicTable>
</div>
