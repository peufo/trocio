<script lang="ts">
  import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

  import type { FieldInteface } from 'types'
  import { renderAmount } from '$lib/utils'
  import IconLink from './IconLink.svelte'

  export let item: unknown
  export let field: FieldInteface
  /** Code ISO 4217 */
  export let currency: string | undefined = undefined

  $: value = getValue(item, field)

  function getValue(item: any, field: FieldInteface) {
    return typeof field.getValue === 'function'
      ? field.getValue(item)
      : item[field.queryKey]
  }
</script>

{#if typeof value === 'string'}
  {#if !value}
    <span> - </span>
  {:else if field.format === 'date'}
    <span> {new Date(value).toLocaleString()} </span>
  {:else if field.format === 'currency'}
    <span>{renderAmount(value, currency)}</span>
  {:else}
    <span>{value}</span>
  {/if}
{:else if typeof value === 'boolean'}
  {#if value}
    <IconLink icon={faCheck} class="green-text" />
  {:else}
    <IconLink icon={faTimes} class="red-text" />
  {/if}
{:else if value === undefined}
  <span> - </span>
{:else}
  <span>{value}</span>
{/if}
