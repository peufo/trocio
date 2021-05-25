<script lang="ts">
  import { fade } from 'svelte/transition'
  import debounce from 'debounce'

  import { Card } from 'svelte-materialify'
  import TrocInfo from '$lib/info/TrocInfo.svelte'
  import Loader from '$lib/util/Loader.svelte'

  import {
    query,
    trocs,
    trocsElement,
    map,
    useSearchTrocs,
    useSearchTrocsOptions,
  } from '$lib/troc/store'

  const queryTrocs = useSearchTrocs($query)
  $: queryTrocs.setOptions(useSearchTrocsOptions($query))
  $: $trocs = $queryTrocs.data ? $queryTrocs.data.pages.flat() : []

  /** Charge les résultat suivant en cas de scroll */
  const handleScroll = debounce(() => {
    if ($queryTrocs.hasNextPage && !$queryTrocs.isFetchingNextPage) {
      const { scrollY, innerHeight } = window
      const appElement: HTMLElement = document.querySelector('#app')
      const { offsetHeight } = appElement
      if (scrollY && scrollY + innerHeight > offsetHeight - 100) {
        $queryTrocs.fetchNextPage()
      }
    }
  }, 50)

  /** Zoom sur le bon marker de la map quand on click sur un troc. */
  function clickTroc(troc) {
    $map?.setView(troc.location, 8)
  }
</script>

<svelte:window on:scroll={handleScroll} />

<div class="container">
  {#if $queryTrocs.isSuccess}
    {#if !$trocs.length}
      <div class="centered" in:fade style="height: 200px;">Pas de résultat</div>
    {:else}
      <div in:fade>
        {#each $trocs as troc (troc._id)}
          <div
            bind:this={$trocsElement[troc._id]}
            on:click={() => clickTroc(troc)}
          >
            <Card class="mb-6 pa-4" hover>
              <TrocInfo {troc} on:clickArticles />
            </Card>
          </div>
        {/each}
      </div>

      {#if !$queryTrocs.hasNextPage}
        <div class="centered" in:fade style="height: 200px;">
          Pas plus de résultat
        </div>
      {/if}
    {/if}
  {:else if $queryTrocs.isError}
    <div class="centered" in:fade style="height: 200px;">
      Oups, une erreur est surveneu !
    </div>
  {/if}

  {#if $queryTrocs.isFetching}
    <div class="centered" in:fade style="height: 200px;">
      <Loader title="Recherche" />
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 850px;
    margin: auto;
    padding-left: 1em;
    padding-right: 1em;
  }
</style>
