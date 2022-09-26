<script lang="ts">
  /**
   * Table with automatique infinit scroll
   */

  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'

  import Loader from '$lib/util/Loader.svelte'
  import { Button } from 'svelte-materialify/src'
  /** Choose if the mode for fetch more items */
  export let mode: 'button' | 'scroll' = 'scroll'
  export let query: UseInfiniteQueryStoreResult<any, any, any, any>
  export let dense = false
  export let style = ''
  let klass = ''
  export { klass as class }
  let wrapper: HTMLDivElement

  query.updateOptions({
    refetchOnWindowFocus: false,
  })

  $: if (mode === 'scroll' && $query.isSuccess)
    setTimeout(() => testScrollPosition(true), 0)

  // reset le compteur de sécurité quand le query change
  $: if (query) {
    noGrowOffsetHeigthCount = 0
    lastOffsetHeight = 0
  }

  /** Sécurité pour évité de fetchNextPage() à l'infini si le rendu n'augmente pas la taille du container */
  const MAX_NO_GROW_OFFSET_HEIGHT = 5
  let lastOffsetHeight = 0
  let noGrowOffsetHeigthCount = 0
  let error = ''

  function handleScroll() {
    if (mode === 'scroll') testScrollPosition()
  }

  function testScrollPosition(isSuccessCallback = false) {
    const { scrollTop, scrollHeight, offsetHeight } = wrapper
    const scrollButtom = offsetHeight + scrollTop
    const isInButtom = scrollButtom + 50 > scrollHeight

    if (isSuccessCallback) {
      if (offsetHeight <= lastOffsetHeight) {
        noGrowOffsetHeigthCount++
      } else {
        noGrowOffsetHeigthCount = 0
      }
      lastOffsetHeight = offsetHeight
      error = ''
      if (noGrowOffsetHeigthCount > MAX_NO_GROW_OFFSET_HEIGHT) {
        error = `Le rendu ne s'effectue pas correctement et ne permet la gestion du scroll`
        return
      }
    }

    if (isInButtom) {
      if (!$query.isFetching && $query.hasNextPage) {
        $query.fetchNextPage()
      }
    }
  }
</script>

<!--

  <svelte:window on:resize={() => testScrollPosition()} />
-->

<div
  class="s-table__wrapper {klass}"
  {style}
  bind:this={wrapper}
  on:scroll={handleScroll}
>
  <table class="s-table fixed-header" class:dense>
    <slot />
  </table>

  <div class="table-footer centered">
    {#if $query.isFetchingNextPage || $query.isLoading}
      <Loader />
    {:else if !$query.hasNextPage}
      <span class="text--secondary">
        Pas {$query.data?.pages.flat().length ? 'plus' : ''} de résultat
      </span>
    {:else if mode === 'button'}
      <Button on:click={() => $query.fetchNextPage()} class="ma-2" depressed>
        Afficher plus
      </Button>
    {/if}
  </div>

  {#if error}
    {error}
  {/if}
</div>

<style>
  :global .s-table__wrapper table thead tr {
    z-index: 1;
  }
</style>
