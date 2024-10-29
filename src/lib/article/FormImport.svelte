<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { Article, ArticleCreate, ISubscribe, Troc } from 'types'
  import { api, useApi } from '$lib/api'
  import { List, ProgressCircular } from '$material'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import ListItem from '$material/components/List/ListItem.svelte'

  export let subscribe: ISubscribe
  const dispatch = createEventDispatcher<{
    done: Article[]
  }>()
  const queryClient = useQueryClient()
  type ArticleImport = ArticleCreate & { _id: string }
  type Importable = {
    _id: string
    articles_count: number
    articles: {
      _id: string
      tagId: string
      name: string
      ref: string
      price: number
    }[]
    troc: Troc
  }

  $: queryImportables = useApi<{ subscribeId: string }, Importable[]>([
    '/articles/importables',
    { subscribeId: subscribe._id },
  ])

  const importArticles = useMutation(
    (articles: ArticleImport[]) =>
      api<ArticleImport[], Article[]>('/api/articles/import', {
        method: 'post',
        data: articles,
        success: `${articles.length} article${
          articles.length > 1 ? 's' : ''
        } importé${articles.length > 1 ? 's' : ''}`,
      }),
    {
      onSuccess: (articles) => {
        $queryImportables.refetch()
        queryClient.invalidateQueries('articles')
        queryClient.invalidateQueries('subscribes/resum')
        dispatch('done', articles)
      },
    }
  )

  async function handleClickImportable(importable: Importable) {
    const articles: ArticleImport[] = importable.articles.map((art) => ({
      ...art,
      providerSubId: subscribe._id,
    }))
    await $importArticles.mutateAsync(articles)
  }
</script>

<div style="min-height: 260px;">
  {#if !$queryImportables.data}
    <div class="placeholder">
      <ProgressCircular indeterminate />
    </div>
  {:else}
    <List disabled={$importArticles.isLoading}>
      {#each $queryImportables.data as importable}
        <ListItem on:click={() => handleClickImportable(importable)}>
          <span>{importable.troc.name}</span>
          {#if importable.troc.schedule && importable.troc.schedule[0]}
            <span style="opacity: 0.7;">
              -
              {new Date(importable.troc.schedule[0].open).toLocaleDateString()}
            </span>
          {/if}

          <svelte:fragment slot="subtitle">
            {importable.articles_count}
            article{importable.articles_count > 1 ? 's' : ''}
          </svelte:fragment>
        </ListItem>
      {:else}
        <div class="placeholder">
          <span style="opacity: .6;">
            Aucun article à importer d'autre trocs.
          </span>
        </div>
      {/each}
    </List>
  {/if}
</div>

<style>
  .placeholder {
    display: grid;
    place-content: center;
    min-height: 216px;
  }
</style>
