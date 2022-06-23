<script lang="ts">
  import { fade } from 'svelte/transition'
  import debounce from 'debounce'

  import { Card } from 'svelte-materialify'
  import TrocInfo from '$lib/troc/Info.svelte'
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
      <div class="centered" in:fade style="height: 200px;">Pas de résultat</div>
    {:else}
      <div in:fade>
        {#each $trocs as troc (`nav-${troc._id}`)}
          <div
            bind:this={$trocsElement[troc._id]}
            on:click={() => clickTroc(troc)}
          >
            <Card class="mb-6 pa-4">
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

  @media only screen and (max-width: 650px) {
    .container {
      padding-left: 0;
      padding-right: 0;
    }
  }
</style>
