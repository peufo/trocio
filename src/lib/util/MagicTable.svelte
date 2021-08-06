<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'
  import type { AxiosError } from 'axios'

  import Loader from '$lib/util/Loader.svelte'

  export let query: UseInfiniteQueryStoreResult<any[], AxiosError<any>, any[]>
  export let dense = false
  export let style: string | undefined
  let klass = ''
  export { klass as class }
  let wrapper: HTMLDivElement

  $: if ($query.isSuccess) setTimeout(testScrollPosition, 0)

  function testScrollPosition() {
    const { offsetHeight, scrollTop, scrollHeight } = wrapper
    const scrollButtom = offsetHeight + scrollTop
    const isInButtom = scrollButtom + 50 > scrollHeight

    console.log({ isInButtom, offsetHeight, scrollTop, scrollHeight })
    if (isInButtom) {
      if (!$query.isFetching && $query.hasNextPage) {
        console.log('FETCH MORE')
        $query.fetchNextPage().then(() => {
          testScrollPosition()
        })
      }
    }
  }
</script>

<svelte:window on:resize={testScrollPosition} />

<div
  class="s-table__wrapper {klass}"
  {style}
  bind:this={wrapper}
  on:scroll={testScrollPosition}
>
  <table class="s-table fixed-header" class:dense>
    <slot />
  </table>
  {#if $query.isFetchingNextPage || $query.isLoading}
    <div class="centered" style="height: 300px;">
      <Loader />
    </div>
  {/if}
</div>
