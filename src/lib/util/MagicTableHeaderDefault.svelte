<script lang="ts">
  import { Menu } from 'svelte-materialify'
  import { params, goto, url } from '@roxi/routify'
  import { faSearch } from '@fortawesome/free-solid-svg-icons'

  import type { FieldInteface } from 'types'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import IconLink from '$lib/util/IconLink.svelte'

  export let field: Partial<FieldInteface>
  let search = ''

  function handleSearch(event: CustomEvent<string>) {
    search = event.detail
    const queryKey = `or_search_${field.queryKey}`
    const query = $params
    if (!search) delete query[queryKey]
    else {
      query[queryKey] = search
    }
    $goto($url(), query)
  }
</script>

<th>
  <Menu hover closeOnClick={false} style="width: 220px;">
    <span slot="activator">
      {field.label}

      {#if search}
        <span class="text-caption" style="white-space: nowrap;">
          <IconLink icon={faSearch} size="1em" />
          {search}
        </span>
      {/if}
    </span>

    <SearchTextField on:search={handleSearch} clearable={false} />
  </Menu>
</th>
