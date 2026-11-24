<script lang="ts">
  import { onMount } from 'svelte'
  import { Menu, ListItem } from '$material'
  import { params, goto, url } from '@roxi/routify'
  import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons'

  import type { FieldInteface } from 'types/magic'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import IconLink from '$lib/util/IconLink.svelte'

  export let field: Partial<FieldInteface>
  export let queryParam: { [key: string]: any } = {}
  let search = ''
  const queryKey = `search_${field.key}`

  /** Champ de recherche, monté seulement quand le menu est ouvert */
  let inputElement: HTMLInputElement | undefined
  // À l'ouverture du menu, affiche la recherche en cours
  // (ne dépend que de inputElement pour ne pas écraser la saisie en cours)
  $: showCurrentSearch(inputElement)
  function showCurrentSearch(input: HTMLInputElement | undefined) {
    if (input) input.value = search
  }

  onMount(() => {
    search = $params[queryKey] || ''
    if (search) queryParam = { ...queryParam, [queryKey]: search }
  })

  function handleClear() {
    if (inputElement) inputElement.value = ''
    handleSearch('')
  }

  function handleSearchEvent(event: CustomEvent<string>) {
    handleSearch(event.detail)
  }

  function handleSearch(value: string) {
    search = value
    const query = $params
    if (!search) {
      delete query[queryKey]
      delete queryParam[queryKey]
    } else {
      query[queryKey] = search
      queryParam[queryKey] = search
    }
    queryParam = queryParam
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

    <SearchTextField
      bind:inputElement
      on:search={handleSearchEvent}
      clearable={false}
    />

    {#if search}
      <ListItem on:click={handleClear} dense>
        <span slot="prepend">
          <IconLink icon={faTimes} />
        </span>
        Pas de recherche
      </ListItem>
    {/if}
  </Menu>
</th>
