<script lang="ts">
  import { params } from '@roxi/routify'

  import MagicTable from '$lib/util/MagicTable.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import { useInfinitApi } from '$lib/api'
  import notify from '$lib/notify'
  import type { Article, ParamsArticleAPI } from 'types'

  import { getFields } from '$lib/article/fields'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import { getHeader } from '$lib/utils'

  export let trocId: string
  export let userId: string

  let searchValue = ''
  let fields = getFields()

  $: queryArticles = useInfinitApi<ParamsArticleAPI, Article[]>([
    'articles',
    {
      trocId,
      exact_provider: userId,
      or_search_name: searchValue,
      or_search_ref: searchValue,
      ...$params,
    },
  ])
  $: articles = $queryArticles.data?.pages.flat() || []

  async function deleteArticle(artId: string) {
    try {
      let res = await fetch(`/api/articles/${artId}`, getHeader({}, 'DELETE'))
      notify.success({ title: 'Article supprimé', icon: 'far fa-trash-alt' })
      return
    } catch (error) {
      console.trace(error)
    }
  }
</script>

{#if articles.length}
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
    <MagicTableBody {fields} items={articles} />
  </MagicTable>
{:else}
  <div class="text-center text--secondary pa-5">Aucun article proposé</div>
{/if}
