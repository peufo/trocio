<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'

  import type { FieldInteface } from 'types'
  import { renderAmount } from '$lib/utils'

  export let fields: FieldInteface[]
  export let query: UseInfiniteQueryStoreResult<any, any, any, any>
  export let placeholder = 'Aucun élément'
  /** Code ISO 4217 */
  export let currency: string | undefined = undefined

  const dispatch = createEventDispatcher()

  $: items = $query.data ? $query.data.pages.flat() : []

  function formatCell(item: any, field: FieldInteface) {
    let value: string =
      typeof field.getValue === 'function'
        ? field.getValue(item)
        : item[field.queryKey]

    if (!value) return '-'

    switch (field.format) {
      case 'date':
        value = new Date(value).toLocaleString()
        break
      case 'currency':
        value = renderAmount(value, currency)
        break
    }

    return value
  }
</script>

<tbody>
  {#each items as item}
    <tr>
      {#each fields.filter((f) => f.visible) as field}
        <td
          on:click={(clickEvent) => dispatch('click', { clickEvent, item })}
          class:currency={field.format === 'currency'}
          class:number={field.format === 'number'}
        >
          {formatCell(item, field)}
        </td>
      {/each}
    </tr>
  {/each}

  {#if !$query.isLoading && !items.length}
    <tr class="text-center placeholder">
      <td
        class="text--secondary pa-16"
        colspan={fields.filter((f) => f.visible).length + 2}
      >
        {placeholder}
      </td>
    </tr>
  {/if}
</tbody>

<style>
  .currency,
  .number {
    text-align: right;
  }
  .placeholder:hover {
    background: none;
    cursor: initial;
  }
</style>
