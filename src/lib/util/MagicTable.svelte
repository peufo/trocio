<script lang="ts">
  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'

  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import MagicTableFieldSelect from '$lib/util/MagicTableFieldSelect.svelte'
  import MagicTableWrapper from '$lib/util/MagicTableWrapper.svelte'
  import MagicTableHeaders from '$lib/util/MagicTableHeaders.svelte'
  import MagicTableBody from '$lib/util/MagicTableBody.svelte'
  import type { FieldInteface } from 'types'

  interface $$Slots {
    title: {}
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
</script>

<div {style} class={klass}>
  <div class="d-flex align-center mb-2">
    <slot name="title" />
    <div class="flex-grow-1" />
    <MagicTableFieldSelect bind:fields />
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

    <MagicTableBody {fields} {query} {currency} on:click />
  </MagicTableWrapper>
</div>
