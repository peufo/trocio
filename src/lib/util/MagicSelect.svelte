<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte'
  import { fly } from 'svelte/transition'
  import { Button, List, ListItem } from 'svelte-materialify/src'
  import { url, params, goto, redirect } from '@roxi/routify'

  import { isMobile } from '$lib/store/layout'
  import SearchTextField from '$lib/util/SearchTextField.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import { useInfinitApi } from '$lib/api'

  let klass = ''
  export { klass as class }
  export let style = ''

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

  /** Maintien la valeur de la sélection est maintenue dans le champ de text */
  export let keepValue = false
  /** Maintien le focus sur le champs de recherche lors des seléction */
  export let keepFocus = false

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
    searchValue = ''
    if (inputElement) inputElement.value = ''
  }

  export function setValue(value: string) {
    if (inputElement) inputElement.value = value
  }

  $: querySearch = useInfinitApi<any, any[]>([
    path,
    { [searchKey]: searchValue, ...queryParams },
  ])
  $: items = $querySearch.data ? $querySearch.data.pages.flat() : []
  $: itemsFiltred = items.filter((item) => !exepted.includes(getKey(item)))

  async function handleSelect(item: any) {
    if (selectKey) {
      const query = $params
      query[selectKey] = getKey(item)
      $goto($url(), query)
    }

    selectedItem = item
    dispatch('select', item)
    if (!inputElement) return
    if (!flatMode) inputElement.value = keepValue ? getValue(item) : ''
    if (!$isMobile && keepFocus) inputElement.focus()
    else inputElement.blur()
    await tick()
    if (selectedIndex >= itemsFiltred.length)
      selectedIndex = itemsFiltred.length - 1
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        if ($isMobile) inputElement?.blur()
        else if (itemsFiltred[selectedIndex])
          handleSelect(itemsFiltred[selectedIndex])

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
    selectedIndex = 0
    if (keepValue) clear()
  }

  function handleBlur() {
    setTimeout(() => (isFocus = false), 200)
  }
</script>

<div class:flatMode class="wrapper {klass}" {style}>
  <div class="d-flex" style="gap: 4px;">
    <SearchTextField
      bind:inputElement
      bind:search={searchValue}
      on:keydown={handleKeydown}
      on:focus={handleFocus}
      on:blur={handleBlur}
      autocomplete="off"
      placeholder={keepValue && !!selectedItem ? ' ' : ''}
      class="flex-grow-1"
      {...$$restProps}
    >
      {label}
    </SearchTextField>

    <slot name="action" />
  </div>

  {#if flatMode}
    <div class="flat-container simple-card">
      {#if $querySearch.isError}
        <span>Oups, un problème est survenu</span>
      {:else}
        {#each itemsFiltred as item, index}
          <div
            class="item selectable simple-card"
            class:active={isFocus && selectedIndex === index}
            on:click={() => handleSelect(item)}
          >
            <span class="text-subtitle-1">{getValue(item)}</span>
            {#if getValue2}
              <br />
              <div class="text-right">
                <span class="text-subtitle-2">{getValue2(item)}</span>
              </div>
            {/if}
          </div>
        {/each}

        {#if !itemsFiltred.length && !$querySearch.isLoading}
          <div class="item simple-card text-center pa-2">
            Aucun résultat {#if searchValue} pour <b>{searchValue}</b>{/if}
          </div>
        {/if}

        {#if $querySearch.hasNextPage && !$querySearch.isFetchingNextPage}
          <Button on:click={() => $querySearch.fetchNextPage()} depressed>
            Afficher plus
          </Button>
        {/if}
      {/if}

      {#if $querySearch.isLoading || $querySearch.isFetchingNextPage}
        <div class="item simple-card text-center pa-2">
          <Loader />
        </div>
      {/if}
    </div>
  {:else if isFocus}
    <div class="list-container elevation-5 rounded" in:fly|local={{ y: 50 }}>
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
              Aucun résultat {#if searchValue} pour <b>{searchValue}</b>{/if}
            </ListItem>
          {/each}
        {/if}
      </List>
    </div>
  {/if}
</div>

<style lang="scss">
  :global(.s-radio .s-text-field__input > label) {
    padding-left: 0px;
  }

  .wrapper {
    position: relative;
    min-width: 200px;
  }

  .list-container {
    position: absolute;
    width: 100%;
    min-width: 260px;
    background: var(--theme-surface);
    margin-top: 4px;
    z-index: 99;
  }

  .wrapper.flatMode {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
  }

  .flat-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-radius: 8px;
    overflow-y: auto;
    padding: 4px;

    .item {
      padding: 4px 8px;
      line-height: 1.3em;

      &.selectable {
        cursor: pointer;
        background: var(--theme-cards);

        &.active {
          background: var(--theme-tables-active);
        }
        &:hover {
          background: var(--theme-tables-hover);
        }
      }
    }
  }
</style>
