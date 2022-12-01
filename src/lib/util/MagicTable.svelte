<script lang="ts">
  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'
  import { createEventDispatcher } from 'svelte'

  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableWrapper from '$lib/util/MagicTableWrapper.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import type { FieldInteface } from 'types/magic'
  import MagicMenu from '$lib/util/MagicMenu.svelte'

  interface $$Slots {
    title: {}
    menu: { item: any; menu: MagicMenu }
  }

  type RowEvent = { clickEvent: MouseEvent; item: any }

  interface EventMap {
    click: RowEvent
  }

  export let query: UseInfiniteQueryStoreResult<any, any, any, any>
  export let queryParams: { [key: string]: unknown }
  export let fields: FieldInteface[]

  let klass = ''
  export { klass as class }
  export let style = ''
  export let wrapperStyle = ''
  export let currency = ''
  export let searchColSpan = 2
  export let searchValue = ''

  const dispatch = createEventDispatcher<EventMap>()
  let menu: MagicMenu
  let item: any

  function handleClickRow(event: CustomEvent<RowEvent>) {
    dispatch('click', event.detail)
    item = event.detail.item
    menu?.open(event.detail.clickEvent)
  }
</script>

{#if $$slots.menu}
  <MagicMenu bind:this={menu}>
    <slot name="menu" {item} {menu} />
  </MagicMenu>
{/if}

<div {style} class={klass}>
  <div class="d-flex align-center mb-2">
    <slot name="title" />
    <div class="flex-grow-1" />
    <MagicTableFieldSelect bind:fields {searchColSpan} />
  </div>

  <MagicTableWrapper
    {query}
    class="simple-card"
    style="min-height: 400px; {wrapperStyle}"
  >
    <thead>
      <tr>
        <th colspan={searchColSpan} style="padding-left: 0px;">
          <SearchTextField bind:search={searchValue} flat solo dense />
        </th>

        <MagicTableHeaders {fields} bind:queryParams {searchColSpan} />
      </tr>
    </thead>

    <MagicTableBody {fields} {query} {currency} on:click={handleClickRow} />
  </MagicTableWrapper>
</div>
