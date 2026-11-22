<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'

  import type { FieldInteface } from 'types/magic'
  import { Checkbox } from '$material'
  import MagicTableCell from './MagicTableCell.svelte'

  export let fields: FieldInteface[]
  export let query: UseInfiniteQueryStoreResult<any, any, any, any>
  /** Code ISO 4217 */
  export let currency: string | undefined = undefined
  /** Affiche une case à cocher en début de ligne */
  export let selectable = false
  /** Éléments sélectionnés, comparés par `_id` */
  export let selected: any[] = []

  const dispatch = createEventDispatcher<{
    click: { clickEvent: MouseEvent; item: any }
  }>()

  $: items = $query?.data ? $query.data.pages.flat() : []
  $: selectedIds = new Set(selected.map((item) => item._id))

  function toggle(item: any) {
    selected = selectedIds.has(item._id)
      ? selected.filter(({ _id }) => _id !== item._id)
      : [...selected, item]
  }
</script>

<tbody>
  {#each items as item}
    <tr class:selected={selectable && selectedIds.has(item._id)}>
      {#if selectable}
        <td class="select-cell">
          <Checkbox
            checked={selectedIds.has(item._id)}
            on:change={() => toggle(item)}
          />
        </td>
      {/if}
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

  .select-cell {
    width: 40px;
    padding-right: 0;
  }

  tr.selected {
    background-color: rgba(33, 150, 243, 0.08);
  }
</style>
