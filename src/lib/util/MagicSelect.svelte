<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { Button, List, ListItem } from '$material'
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
  /** Désactive la pagination */
  export let disableFetchNext = false

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

  {#if isFocus || flatMode}
    <div
      class="list-container simple-card"
      class:fly-mode={!flatMode}
      class:isFocus
      in:fly|local={{ y: 50 }}
      out:fade|local={{ duration: 100 }}
    >
      {#if $querySearch.isError}
        <span>Oups, un problème est survenu</span>
      {:else}
        {#each itemsFiltred as item, index (item._id || item.userId)}
          <div
            class="item selectable simple-card"
            class:active={isFocus && selectedIndex === index}
            animate:flip={{ duration: 200 }}
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

        {#if !disableFetchNext && $querySearch.hasNextPage && !$querySearch.isFetchingNextPage}
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

  .wrapper.flatMode {
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
  }

  .list-container {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-radius: 8px;
    overflow-y: auto;
    padding: 4px;
    background: var(--theme-surface);

    &.fly-mode {
      position: absolute;
      width: 100%;
      min-width: 260px;
      margin-top: 4px;
      z-index: 99;
    }

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
