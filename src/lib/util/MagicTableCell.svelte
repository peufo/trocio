<script lang="ts">
  import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'
  import objectPath from 'object-path'

  import type { FieldInteface } from 'types/magic'
  import { renderAmount } from '$lib/utils'
  import IconLink from './IconLink.svelte'

  export let item: unknown
  export let field: FieldInteface
  /** Code ISO 4217 */
  export let currency: string | undefined = undefined

  $: value = getValue(item, field)

  function getValue(item: any, field: FieldInteface) {
    if (typeof field.getValue === 'function') return field.getValue(item)
    return objectPath.get(item, field.key)
  }
</script>

{#if typeof value === 'string' || typeof value === 'number'}
  {#if !value}
    <span> - </span>
  {:else if field.type === 'date'}
    <span> {new Date(value).toLocaleString()} </span>
  {:else if field.type === 'currency'}
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
