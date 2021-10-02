<script lang="ts">
  import { onMount } from 'svelte'
  import { params, goto, url } from '@roxi/routify'
  import { Menu } from 'svelte-materialify'
  import MagicSelect from '$lib/util/MagicSelect.svelte'

  import type { FieldInteface } from 'types'

  export let field: Partial<FieldInteface>
</script>

<th>
  <Menu hover closeOnClick={false}>
    <span slot="activator">
      {field.label}
      <span class="text-caption">{'TODO'}</span>
    </span>
    {#if field.selectOption}
      <MagicSelect
        flatMode
        keepValue
        selectKey="exact_{field.queryKey}"
        path={field.selectOption?.path || ''}
        searchKey={field.selectOption?.searchKey || ''}
        getValue={field.selectOption?.getValue}
        getValue2={field.selectOption?.getValue2}
      />
    {/if}
  </Menu>
</th>
