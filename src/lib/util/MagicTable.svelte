<script lang="ts">
  /**
   * Table with automatique infinit scroll
   */

  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'

  import Loader from '$lib/util/Loader.svelte'

  export let query: UseInfiniteQueryStoreResult<any, any, any, any>
  export let dense = false
  export let style = ''
  let klass = ''
  export { klass as class }
  let wrapper: HTMLDivElement

  query.updateOptions({
    refetchOnWindowFocus: false,
  })

  $: if ($query.isSuccess) setTimeout(() => testScrollPosition(true), 0)

  /** Sécurité pour évité de fetchNextPage() à l'infini si le rendu n'augmente pas la taille du container */
  const MAX_NO_GROW_OFFSET_HEIGHT = 5
  let lastOffsetHeight = 0
  let noGrowOffsetHeigthCount = 0
  let error = ''

  function testScrollPosition(isSuccessCallback = false) {
    const { offsetHeight, scrollTop, scrollHeight } = wrapper
    const scrollButtom = offsetHeight + scrollTop
    const isInButtom = scrollButtom + 50 > scrollHeight

    if (isSuccessCallback) {
      if (offsetHeight <= lastOffsetHeight) {
        noGrowOffsetHeigthCount++
      } else {
        noGrowOffsetHeigthCount = 0
      }
      lastOffsetHeight = offsetHeight

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
  on:scroll={() => testScrollPosition()}
>
  <table class="s-table fixed-header" class:dense>
    <slot />
  </table>
  {#if $query.isFetchingNextPage || $query.isLoading}
    <div class="centered" style="height: 300px;">
      <Loader />
    </div>
  {/if}
  {#if error}
    {error}
  {/if}
</div>
