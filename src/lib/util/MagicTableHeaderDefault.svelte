<script lang="ts">
  import { onMount } from 'svelte'
  import { Menu, ListItem } from 'svelte-materialify/src'
  import { params, goto, url } from '@roxi/routify'
  import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'

  import type { FieldInteface } from 'types'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import IconLink from '$lib/util/IconLink.svelte'

  export let field: Partial<FieldInteface>
  let search = ''
  let queryKey =
    field.format === 'string'
      ? `or_search_${field.queryKey}`
      : `user_search_${field.queryKey}`

  onMount(() => {
    search = $params[queryKey] || ''
  })

  function handleSearchEvent(event: CustomEvent<string>) {
    handleSearch(event.detail)
  }

  function handleSearch(value: string) {
    search = value
    const query = $params
    if (!search) delete query[queryKey]
    else {
      query[queryKey] = search
    }
    $goto($url(), query)
  }
</script>

<th>
  <Menu closeOnClick={false} style="width: 220px;">
    <span slot="activator" class="clickable">
      {field.label}
      {#if search}
        <span class="text-caption" style="white-space: pre;">
          <IconLink icon={faSearch} size="1em" />
          {search}
        </span>
      {/if}
    </span>

    <SearchTextField on:search={handleSearchEvent} clearable={false} />

    {#if search}
      <ListItem on:click={() => handleSearch('')} dense>
        <span slot="prepend">
          <IconLink icon={faTimes} />
        </span>
        Pas de recherche
      </ListItem>
    {/if}
  </Menu>
</th>
