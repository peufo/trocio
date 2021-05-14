<script lang="ts">
  import { fade } from 'svelte/transition'

  import debounce from 'debounce'
  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'

  import type { Troc } from 'types'

  import { Card } from 'svelte-materialify'
  import TrocInfo from '$lib/info/TrocInfo.svelte'
  import Loader from '$lib/util/Loader.svelte'

  export let queryTrocs: UseInfiniteQueryStoreResult
  export let trocs: Troc[] = []
  export let trocsElement: HTMLElement[] = []

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
</script>

<svelte:window on:scroll={handleScroll} />

<div class="container">
  {#if $queryTrocs.isSuccess}
    {#if !trocs.length}
      <div class="centered" in:fade style="height: 200px;">Pas de résultat</div>
    {:else}
      <div in:fade>
        {#each trocs.sort((a, b) => b.up - a.up) as troc (troc._id)}
          <div bind:this={trocsElement[troc._id]}>
            <Card class="mt-8 pa-4">
              <TrocInfo {troc} on:clickArticles={() => console.log('TODO')} />
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
    padding-left: 1em;
    padding-right: 1em;
  }
</style>
