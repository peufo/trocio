<script lang="ts">
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
  import ArticleDetailDialog from '$lib/article/DetailDialog.svelte'

  let searchValue = ''
  let fields = getFieldsLookup($params.trocId)
  let articleSelected: ArticleLookup | undefined = undefined
  let detailDialogActive = false

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

  function handleClick(event: { detail: { item: ArticleLookup } }) {
    articleSelected = event.detail.item
    detailDialogActive = true
  }
</script>

<ArticleDetailDialog
  bind:active={detailDialogActive}
  article={articleSelected}
  modeAdmin
/>

<div class="container">
  <div class="d-flex align-center mb-2">
    <h6>Gestion des articles</h6>
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
            flat
            solo
            dense
          />
        </th>

        <MagicTableHeaders {fields} bind:queryParams />
      </tr>
    </thead>

    <MagicTableBody
      {fields}
      {query}
      currency={$troc.currency}
      on:click={handleClick}
    />
  </MagicTable>
</div>
