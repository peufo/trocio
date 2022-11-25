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

  /** Permet de remonter le query sans passer par $params (trop global) */
  export let queryParams: { [key: string]: any } = {}
  console.log({ queryParams })

  /** Nombre de colonne laisser pour le champ de recherche */
  export let searchColSpan = 0

  $: headers = fields.filter((f, i) => i >= searchColSpan && !f.hidden)

  const components: Partial<Record<string & FieldInteface['type'], any>> = {
    string: MagicTableHeaderDefault,
    select: MagicTableHeaderEnum,
    selectAsync: MagicTableHeaderSelect,
    number: MagicTableHeaderNumber,
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
