<script>
  import { fade } from 'svelte/transition'
  import { TextField, Icon } from 'svelte-materialify'

  import Loader from '$lib/util/Loader.svelte'

  import { useArticles, useArticlesOptions } from '$lib/article/store'
  import { debounce } from 'debounce'

  export let trocId = ''
  let search = ''

  const queryArticles = useArticles(trocId, search)
  $: queryArticles.setOptions(useArticlesOptions(trocId, search))
  $: articles = $queryArticles.data ? $queryArticles.data.pages.flat() : []

  const handleSearch = debounce((event) => {
    search = event.target.value
  }, 300)
</script>

<TextField
  on:input={handleSearch}
  on:change={handleSearch}
  clearable
  placeholder="Recherche d'article"
  class="mt-3 mb-1 ml-1"
  style="width: 35%; min-width: 200px;"
>
  <div slot="prepend">
    <Icon class="fas fa-search" />
  </div>
</TextField>

{#if $queryArticles.isSuccess}
  {#if !articles.length}
    <div in:fade|local={{ delay: 200 }} class="text-center text--secondary">
      <span>Aucun article trouvé</span>
    </div>
  {:else}
    <div in:fade|local class="d-flex flex-wrap">
      {#each articles as article}
        <div
          class="simple-card pl-2 pr-2 pt-1 pb-1 ma-1 flex-grow-1"
          style="max-width: 50%;"
        >
          <span class="text-subtitle-2">{article.name}</span>
          <br />
          <div class="text-right">
            <b class="text-caption" style="line-height: 1;">
              {!isNaN(article.price) && Number(article.price).toFixed(2)}
            </b>
          </div>
        </div>
      {/each}
    </div>
  {/if}
{:else if $queryArticles.isError}
  <div in:fade|local class="centered mt-3">Oups, une erreur est survenue !</div>
{/if}

{#if $queryArticles.isFetching}
  <div in:fade|local={{ delay: 200 }} class="centered mt-3">
    <Loader />
  </div>
{:else if $queryArticles.hasNextPage}
  <!-- Bonton pour plus de résultats-->
  <div
    in:fade|local
    class="underline-div text-center text--secondary mt-3"
    on:click={() => $queryArticles.fetchNextPage()}
  >
    <span class="underline-span">Afficher plus</span>
  </div>
{/if}
