<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fly } from 'svelte/transition'
  import { List, ListItem } from 'svelte-materialify'
  import { url, params, goto, redirect } from '@roxi/routify'

  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { useApi } from '$lib/api'

  export let label = ''
  export let inputElement: HTMLInputElement | undefined = undefined
  export let selectedItem: any = null
  export let queryParams: object = {}

  export let searchValue = ''

  /** Url path for search items */
  export let path: string
  /** key used in url for search values */
  export let searchKey: string
  /** key used in url for select à value. exemple: 'providerId' */
  export let selectKey: string | undefined = undefined

  /** Function for obtain unique string key from item */
  export let getKey: (item: any) => string = (item) => item?._id
  /** Items key hidden */
  export let exepted: string[] = []

  /** Si vrai, la valeur de la sélection est maintenue dans le champ de text */
  export let keepValue = false
  /** func used for obtain name from item */
  export let getValue: (item: any) => string = (item) => item?.name
  /** func used for obtain the secoundary name from item */
  export let getValue2: ((item: any) => string) | undefined = undefined

  /** Si vrai, les choix sont en permanance visible */
  export let flatMode = false
  let selectedIndex = 0
  let isFocus = false
  const dispatch = createEventDispatcher()

  export function focus() {
    inputElement?.focus()
  }

  export function clear() {
    if (selectKey) {
      const query = $params
      delete query[selectKey]
      $redirect($url(), query)
    }
    selectedItem = null
    if (inputElement) inputElement.value = ''
  }

  export function setValue(value: string) {
    if (inputElement) inputElement.value = value
  }

  // $: searchValue = $params[searchKey] || '' // <-- Communication par $params, inutil...
  $: querySearch = useApi<any, any[]>([
    path,
    { [searchKey]: searchValue, ...queryParams },
  ])
  $: items = $querySearch.data ? $querySearch.data.flat() : []
  $: itemsFiltred = items.filter((item) => !exepted.includes(getKey(item)))

  function handleSelect(item: any) {
    if (selectKey) {
      const query = $params
      query[selectKey] = getKey(item)
      $goto($url(), query)
    }

    selectedItem = item
    dispatch('select', item)
    if (!inputElement) return
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
    isFocus = true
    if (keepValue) clear()
  }

  function handleBlur() {
    setTimeout(() => {
      isFocus = false
    }, 200)
  }
</script>

<div style="position: relative; min-width: 200px;">
  <SearchTextField
    bind:inputElement
    bind:search={searchValue}
    on:keydown={handleKeydown}
    on:focus={handleFocus}
    on:blur={handleBlur}
    autocomplete="off"
    placeholder={keepValue && !!selectedItem ? ' ' : ''}
    class="mt-2"
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
  {:else if isFocus}
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
