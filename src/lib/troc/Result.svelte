<script lang="ts">
  import { fade } from 'svelte/transition'
  import debounce from 'debounce'

  import TrocCard from '$lib/troc/Card.svelte'
  import Loader from '$lib/util/Loader.svelte'

  import { queryTrocsParams, trocs, trocsElement, map } from '$lib/troc/store'
  import { useInfinitApi } from '$lib/api'
  import type { SearchTrocsQuery, TrocLookup } from 'types'

  $: queryTrocs = useInfinitApi<SearchTrocsQuery, TrocLookup[]>({
    queryKey: ['trocs', $queryTrocsParams],
  })
  $: $trocs = $queryTrocs.data ? $queryTrocs.data.pages.flat() : []

  /** Charge les résultat suivant en cas de scroll */
  const handleScroll = debounce(() => {
    if ($queryTrocs.hasNextPage && !$queryTrocs.isFetchingNextPage) {
      const { scrollY, innerHeight } = window
      const appElement = document.querySelector<HTMLDivElement>('#app')
      if (!appElement) return
      const { offsetHeight } = appElement
      if (scrollY && scrollY + innerHeight > offsetHeight - 100) {
        $queryTrocs.fetchNextPage()
      }
    }
  }, 50)

  /** Zoom sur le bon marker de la map quand on click sur un troc. */
  function clickTroc(troc: TrocLookup) {
    if (!troc.location) return
    $map?.setView(troc.location, 8)
  }
</script>

<svelte:window on:scroll={handleScroll} />

<div class="container">
  {#if $queryTrocs.isSuccess}
    {#if !$trocs.length}
      <div class="text--disabled centered" in:fade style="height: 200px;">
        Pas de résultat pour cette recherche
      </div>
    {:else}
      <div in:fade class="list">
        {#each $trocs as troc (`nav-${troc._id}`)}
          <a
            bind:this={$trocsElement[troc._id]}
            on:click={() => clickTroc(troc)}
            href="/trocs/{troc._id}"
          >
            <TrocCard {troc} on:clickArticles clickable />
          </a>
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
      Oups, une erreur est survenue !
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

  .list {
    display: flex;
    flex-direction: column;
    gap: 1.6em;
  }

  @media only screen and (max-width: 650px) {
    .container {
      padding-left: 0;
      padding-right: 0;
    }
  }
</style>
