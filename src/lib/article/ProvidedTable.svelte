<script lang="ts">
  import { params } from '@roxi/routify'

  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import { useInfinitApi } from '$lib/api'
  import notify from '$lib/notify'
  import type { ArticleLookup, ParamsArticleAPI } from 'types'
  import ArticleDetailDialog from '$lib/article/DetailDialog.svelte'

  import { getFields } from '$lib/article/fields'
  import SearchTextField from '$lib/util/SearchTextField.svelte'

  export let trocId: string
  export let userId: string

  let searchValue = ''
  let fields = getFields()
  let articleSelected: ArticleLookup | undefined = undefined
  let detailDialogActive = false

  $: queryArticles = useInfinitApi<ParamsArticleAPI, ArticleLookup[]>([
    'articles',
    {
      trocId,
      include_without_name: true,
      exact_provider: userId,
      or_search_name: searchValue,
      or_search_ref: searchValue,
      ...$params,
    },
  ])
  $: articles = $queryArticles.data?.pages.flat() || []

  function handleClick(event: { detail: ArticleLookup }) {
    articleSelected = event.detail
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
        />
      </th>

      <MagicTableHeaders {fields} />
    </tr>
  </thead>
  <MagicTableBody
    {fields}
    items={articles}
    on:click={handleClick}
    placeholder="Aucun article"
  />
</MagicTable>
