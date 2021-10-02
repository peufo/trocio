<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { fly } from 'svelte/transition'
  import { List, ListItem } from 'svelte-materialify'
  import { url, params, goto } from '@roxi/routify'

  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { useApi } from '$lib/api'

  export let label = 'Chercher un utilisateur'
  export let inputElement: HTMLInputElement
  export let selectedItem: any = null

  export let searchValue = ''

  /** Url path for search items */
  export let path: string
  /** key used in url for search values */
  export let searchKey: string
  /** key used in url for select à value. exemple: 'provider' */
  export let selectKey: string

  /** Function for obtain unique string key from item */
  export let getKey: (item: any) => string = (item) => item._id
  /** Items key hidden */
  export let exepted: string[] = []

  /** Si vrai, la valeur de la sélection est maintenue dans le champ de text */
  export let keepValue = false
  /** func used for obtain name from item */
  export let getValue: (item: any) => string = (item) => item.name
  /** func used for obtain the secoundary name from item */
  export let getValue2: (item: any) => string | undefined

  /** Si vrai, les choix sont en permanance visible */
  export let flatMode = false
  let selectedIndex = 0
  let focus = false
  const dispatch = createEventDispatcher()

  $: searchValue = $params[searchKey] || ''
  $: querySearch = useApi<any, any[]>([path, { [searchKey]: searchValue }])
  $: items = $querySearch.data ? $querySearch.data.flat() : []
  $: itemsFiltred = items.filter((item) => !exepted.includes(getKey(item)))

  function handleSelect(item: any) {
    const query = $params
    query[selectKey] = getKey(item)
    $goto($url(), query)

    selectedItem = item
    dispatch('select', item)
    inputElement.value = keepValue ? getValue(item) : ''
    inputElement.blur()
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        if (selectedIndex > -1) {
          handleSelect(itemsFiltred[selectedIndex])
        }
        break

      case 'ArrowDown':
        event.preventDefault()
        if (++selectedIndex >= itemsFiltred.length) selectedIndex = 0
        break

      case 'ArrowUp':
        event.preventDefault()
        if (--selectedIndex < 0) selectedIndex = itemsFiltred.length - 1
        break

      default:
        selectedIndex = 0
    }
  }

  function handleFocus() {
    focus = true
    if (keepValue) {
      selectedItem = null
      inputElement.value = ''
    }
  }

  function handleBlur() {
    setTimeout(() => {
      focus = false
    }, 200)
  }
</script>

<div style="position: relative;">
  <SearchTextField
    bind:inputElement
    {searchKey}
    on:keydown={handleKeydown}
    on:focus={handleFocus}
    on:blur={handleBlur}
    autocomplete="off"
    placeholder={keepValue && !!selectedItem ? ' ' : ''}
    {...$$restProps}
  >
    {label}
  </SearchTextField>
  {#if flatMode}
    <List dense>
      {#if $querySearch.isLoading}
        <ListItem disabled><Loader /></ListItem>
      {:else if $querySearch.isError}
        <ListItem disabled>Oups, un problème est survenu</ListItem>
      {:else}
        {#each itemsFiltred as item, index}
          <ListItem
            active={selectedIndex === index}
            on:click={() => handleSelect(item)}
          >
            {getValue(item)}
            <span slot="subtitle">
              {#if getValue2}{getValue2(item)}{/if}
            </span>
          </ListItem>
        {:else}
          <ListItem disabled>
            Aucun résultat pour <b>{searchValue}</b>
          </ListItem>
        {/each}
      {/if}
    </List>
  {:else if focus}
    <div class="items elevation-5 rounded" in:fly|local={{ y: 50 }}>
      <List dense>
        {#if $querySearch.isLoading}
          <ListItem disabled><Loader /></ListItem>
        {:else if $querySearch.isError}
          <ListItem disabled>Oups, un problème est survenu</ListItem>
        {:else}
          {#each itemsFiltred as item, index}
            <ListItem
              active={selectedIndex === index}
              on:click={() => handleSelect(item)}
            >
              {getValue(item)}

              <span slot="subtitle">
                {#if getValue2}{getValue2(item)}{/if}
              </span>
            </ListItem>
          {:else}
            <ListItem disabled>
              Aucun résultat pour <b>{searchValue}</b>
            </ListItem>
          {/each}
        {/if}
      </List>
    </div>
  {/if}
</div>

<style>
  .items {
    position: absolute;
    width: 100%;
    min-width: 260px;
    background: var(--theme-surface);
    margin-top: 4px;
    z-index: 99;
  }
  :global(.s-radio .s-text-field__input > label) {
    padding-left: 0px;
  }
</style>
