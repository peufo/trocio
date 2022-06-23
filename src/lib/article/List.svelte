<script lang="ts">
  import { fade } from 'svelte/transition'

  import Loader from '$lib/util/Loader.svelte'
  import { renderAmount } from '$lib/utils'
  import { useInfinitApi } from '$lib/api'
  import type { Article, DynamicQueryArticle } from 'types'
  import SearchTextField from '$lib/util/SearchTextField.svelte'

  export let trocId = ''
  export let currency = ''
  export let search = ''
  let klass = ''
  export { klass as class }

  $: queryArticles = useInfinitApi<DynamicQueryArticle, Article>([
    'articles',
    { exact_trocId: trocId, or_search_name: search },
  ])
  $: articles = $queryArticles.data ? $queryArticles.data.pages.flat() : []
</script>

<div class={klass}>
  <SearchTextField bind:search placeholder="Chercher un article" solo />

  {#if $queryArticles.isSuccess}
    {#if !articles.length}
      <div in:fade|local={{ delay: 200 }} class="text--secondary">
        <span>Aucun article trouvé</span>
      </div>
    {:else}
      <div in:fade|local class="d-flex flex-wrap" style="gap: 12px;">
        {#each articles as article}
          <div
            class="simple-card pl-2 pr-2 pt-1 pb-1 flex-grow-1"
            style="max-width: calc(50% - 6px);"
          >
            <span class="text-subtitle-2">{article.name}</span>
            <br />
            <div class="text-right">
              <b class="text-caption" style="line-height: 1;">
                {renderAmount(article.price, currency)}
              </b>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {:else if $queryArticles.isError}
    <div in:fade|local class="mt-3">Oups, une erreur est survenue !</div>
  {/if}

  {#if $queryArticles.isFetching}
    <div in:fade|local={{ delay: 200 }} class="mt-3">
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
