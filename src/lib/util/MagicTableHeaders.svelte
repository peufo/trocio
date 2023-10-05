<script lang="ts">
  /**
   * Automatique params and table headers sync
   */

  import type { FieldInteface } from 'types/magic'
  import MagicTableHeaderDefault from '$lib/util/MagicTableHeaderDefault.svelte'
  import MagicTableHeaderSelect from '$lib/util/MagicTableHeaderSelect.svelte'
  import MagicTableHeaderSelectAsync from '$lib/util/MagicTableHeaderSelectAsync.svelte'
  import MagicTableHeaderNumber from '$lib/util/MagicTableHeaderNumber.svelte'

  export let fields: FieldInteface[]

  /** Permet de remonter le query sans passer par $params (trop global) */
  export let queryParams: { [key: string]: any } = {}

  /** Nombre de colonne laisser pour le champ de recherche */
  export let searchColSpan = 0

  $: headers = fields.filter((f, i) => i >= searchColSpan && !f.hidden)

  const components: Partial<Record<string & FieldInteface['type'], any>> = {
    string: MagicTableHeaderDefault,
    number: MagicTableHeaderNumber,
    boolean: MagicTableHeaderSelect,
    select: MagicTableHeaderSelect,
    selectAsync: MagicTableHeaderSelectAsync,
    currency: MagicTableHeaderNumber,
    date: MagicTableHeaderNumber,
  }
</script>

{#each headers as field, index (field.key)}
  <svelte:component
    this={field.type ? components[field.type] : MagicTableHeaderDefault}
    {field}
    isLast={headers.length - 1 === index}
    bind:queryParam={queryParams}
  />
{/each}
