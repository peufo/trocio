<script lang="ts">
  import { params } from '@roxi/routify'

  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import { useInfinitApi } from '$lib/api'
  import type { ArticleLookup, ParamsArticleAPI } from 'types'
  import ArticleDetailDialog from '$lib/article/DetailDialog.svelte'

  import { getFields } from '$lib/article/fields'
  import SearchTextField from '$lib/util/SearchTextField.svelte'

  export let subscribeId: string

  let searchValue = ''
  let fields = getFields()
  let articleSelected: ArticleLookup | undefined = undefined
  let detailDialogActive = false

  let queryParams = {}

  $: queryArticles = useInfinitApi<ParamsArticleAPI, ArticleLookup[]>([
    'articles',
    {
      exact_providerSubId: subscribeId,
      include_without_name: true,
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
/>

<MagicTable
  query={queryArticles}
  mode="button"
  class="mb-2"
  style="min-height: 330px;"
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
    query={queryArticles}
    on:click={handleClick}
    placeholder="Aucun article"
  />
</MagicTable>
