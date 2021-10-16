<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import type { FieldInteface } from 'types'
  import { renderAmount } from '$lib/utils'

  export let fields: FieldInteface[]
  export let items: any[]

  /** Code ISO 4217 */
  export let currency: string | undefined = undefined

  const dispatch = createEventDispatcher()

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
          on:click={() => dispatch('click', item)}
          class:currency={field.format === 'currency'}
          class:number={field.format === 'number'}
        >
          {formatCell(item, field)}
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
