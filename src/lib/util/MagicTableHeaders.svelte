<script lang="ts">
  /**
   * Automatique params and table headers sync
   */

  import type { FieldInteface } from 'types'
  import MagicTableHeaderSelect from '$lib/util/MagicTableHeaderSelect.svelte'
  import MagicTableHeaderDefault from '$lib/util/MagicTableHeaderDefault.svelte'

  export let fields: Partial<FieldInteface>[]

  const components = {
    select: MagicTableHeaderSelect,
  }
</script>

{#each fields.filter((f) => !f.disabled && f.checked) as field}
  <svelte:component
    this={components[field.typeMenu] || MagicTableHeaderDefault}
    {field}
  />
{/each}
