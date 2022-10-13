<script lang="ts">
  import { fade } from 'svelte/transition'

  import { Chip } from '$material'
  import Loader from '$lib/util/Loader.svelte'
  import { renderAmount } from '$lib/utils'
  import { useInfinitApi } from '$lib/api'
  import type { Article, DynamicQueryArticle } from 'types'
  import SearchTextField from '$lib/util/SearchTextField.svelte'

  export let trocId = ''
  export let currency = ''
  export let search = ''
  export let placeholder = 'Chercher un article'
  let klass = ''
  export { klass as class }

  $: queryArticles = useInfinitApi<DynamicQueryArticle, Article>([
    'articles',
    { exact_trocId: trocId, or_search_name: search },
  ])
  $: articles = $queryArticles.data ? $queryArticles.data.pages.flat() : []
</script>

<div class={klass}>
  <SearchTextField bind:search {placeholder} solo flat />

  {#if $queryArticles.isSuccess}
    {#if !articles.length}
      <div in:fade|local={{ delay: 200 }} class="text--secondary">
        <span>Aucun article trouvé</span>
      </div>
    {:else}
      <div in:fade|local class="d-flex flex-wrap" style="gap: 8px;">
        {#each articles as article}
          <div class="simple-card article d-flex flex-column">
            <div class="text-subtitle-1">{article.name}</div>
            <div class="flex-grow-1" />
            <div class="d-flex">
              <div class="flex-grow-1" />
              <Chip label size="small">
                {renderAmount(article.price, currency)}
              </Chip>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {:else if $queryArticles.isError}
    <div in:fade|local class="centered" style="height: 100px;">
      Oups, une erreur est survenue !
    </div>
  {/if}

  {#if $queryArticles.isFetching}
    <div in:fade|local={{ delay: 200 }} class="centered" style="height: 100px;">
      <Loader />
    </div>
  {:else if $queryArticles.hasNextPage}
    <!-- Bonton pour plus de résultats-->
    <div
      in:fade|local
      class="underline-div text--secondary mt-3 ml-2"
      on:click={() => $queryArticles.fetchNextPage()}
    >
      <span class="underline-span">Afficher plus</span>
    </div>
  {/if}
</div>

<style>
  .article {
    background: var(--theme-navigation-drawer);
    max-width: calc(50% - 4px);
    flex-grow: 1;
    padding: 4px;
    border-radius: 8px;
  }
</style>
