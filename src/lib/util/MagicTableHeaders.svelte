<script lang="ts">
  /**
   * Automatique params and table headers sync
   */

  import type { FieldInteface } from 'types'
  import MagicTableHeaderDefault from '$lib/util/MagicTableHeaderDefault.svelte'
  import MagicTableHeaderEnum from '$lib/util/MagicTableHeaderEnum.svelte'
  import MagicTableHeaderSelect from '$lib/util/MagicTableHeaderSelect.svelte'
  import MagicTableHeaderNumber from '$lib/util/MagicTableHeaderNumber.svelte'

  export let fields: FieldInteface[]

  // Permet de remonter le query sans passer par $params (trop global)
  export let queryParams: { [key: string]: any } = {}

  $: headers = fields.filter((f) => !f.disabled && f.visible)

  const components: Partial<Record<FieldInteface['format'], any>> = {
    enum: MagicTableHeaderEnum,
    select: MagicTableHeaderSelect,
    number: MagicTableHeaderNumber,
    currency: MagicTableHeaderNumber,
    date: MagicTableHeaderNumber,
  }
</script>

{#each headers as field, index (field.queryKey)}
  <svelte:component
    this={components[field.format] || MagicTableHeaderDefault}
    {field}
    isLast={headers.length - 1 === index}
    bind:queryParam={queryParams}
  />
{/each}
