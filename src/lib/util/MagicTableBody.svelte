<script lang="ts">
  import type { FieldInteface } from 'types'

  export let fields: FieldInteface[]
  export let items: any[]

  /** Code ISO 4217*/
  export let currency: string | undefined = undefined

  function formatCell(item: any, field: FieldInteface) {
    let value: string =
      typeof field.getValue === 'string'
        ? item[field.getValue]
        : field.getValue(item)

    if (!value) return '-'

    switch (field.format) {
      case 'date':
        value = new Date(value).toLocaleString()
        break
      case 'curency':
        value = Number(value).toLocaleString(
          undefined,
          currency
            ? {
                style: 'currency',
                currency,
              }
            : {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }
        )
        break
    }

    return value
  }
</script>

<tbody>
  {#each items as item}
    <tr>
      {#each fields.filter((f) => f.checked) as field}
        <td class:curency={field.format === 'curency'}>
          {formatCell(item, field)}
        </td>
      {/each}
    </tr>
  {/each}
</tbody>

<style>
  .curency {
    text-align: right;
  }
</style>
