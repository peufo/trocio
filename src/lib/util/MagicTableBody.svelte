<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'

  import type { FieldInteface } from 'types/magic'
  import MagicTableCell from './MagicTableCell.svelte'

  export let fields: FieldInteface[]
  export let query: UseInfiniteQueryStoreResult<any, any, any, any>
  /** Code ISO 4217 */
  export let currency: string | undefined = undefined

  const dispatch = createEventDispatcher<{
    click: { clickEvent: MouseEvent; item: any }
  }>()

  $: items = $query?.data ? $query.data.pages.flat() : []
</script>

<tbody>
  {#each items as item}
    <tr>
      {#each fields.filter((f) => !f.hidden) as field}
        <td
          on:click={(clickEvent) => dispatch('click', { clickEvent, item })}
          class:currency={field.type === 'currency'}
          class:number={field.type === 'number'}
        >
          <MagicTableCell {item} {field} {currency} />
        </td>
      {/each}
    </tr>
  {/each}
</tbody>

<style>
  .currency,
  .number {
    text-align: right;
  }
</style>
