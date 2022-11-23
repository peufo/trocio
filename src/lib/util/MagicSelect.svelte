<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { flip } from 'svelte/animate'
  import { url, params, goto, redirect } from '@roxi/routify'
  import { debounce } from 'debounce'

  import { Button } from '$material'
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

  /** Les choix sont en permanance visible */
  export let flatMode = false
  /** Le champ est reduit à un simple îcon*/
  export let reduceMode = false

  export let isOpen = false
  let isFocus = false
  let selectedIndex = 0
  let listContainer: HTMLDivElement

  interface EventsMap {
    select: any
    focus: FocusEvent
    blur: FocusEvent
  }

  const dispatch = createEventDispatcher<EventsMap>()

  export function focus() {
    inputElement?.focus()
  }
  export function blur() {
    inputElement?.blur()
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
        scrollToSelected()
        break

      case 'ArrowUp':
        event.preventDefault()
        if (--selectedIndex < 0) selectedIndex = itemsFiltred.length - 1
        scrollToSelected()
        break

      default:
        selectedIndex = 0
    }
  }

  function handleFocus(event: FocusEvent) {
    isFocus = true
    isOpen = true
    dispatch('focus', event)
    selectedIndex = 0
    if (keepValue) clear()
  }

  const closeDebounced = debounce(() => (isOpen = isFocus), 200)
  function handleBlur(event: FocusEvent) {
    isFocus = false
    dispatch('blur', event)
    if (!flatMode) closeDebounced()
    else isOpen = false
  }

  function scrollToSelected() {
    const el = listContainer.querySelector(
      `.item[data-index="${selectedIndex}"]`
    ) as HTMLLIElement
    if (!el) return
    const top = el.offsetTop - 3
    if (top < listContainer.scrollTop) {
      listContainer.scrollTo({ top })
      return
    }
    const bottom = el.offsetTop + el.offsetHeight
    const delta =
      bottom - (listContainer.scrollTop + listContainer.offsetHeight) + 6
    if (delta > 0) {
      listContainer.scrollTo({ top: listContainer.scrollTop + delta })
      return
    }
  }
</script>

<div
  class:flatMode
  class="wrapper {reduceMode && !isOpen ? 'reduced' : ''} {klass}"
  {style}
  on:click={() => {
    if (reduceMode && !isOpen) focus()
  }}
>
  <div class="d-flex" style="gap: 4px;">
    <SearchTextField
      bind:inputElement
      bind:search={searchValue}
      on:keydown={handleKeydown}
      on:focus={handleFocus}
      on:blur={handleBlur}
      autocomplete="off"
      placeholder={keepValue && !!selectedItem ? ' ' : ''}
      class="flex-grow-1 "
      {...$$restProps}
    >
      {label}
    </SearchTextField>

    <slot name="action" />
  </div>

  {#if isOpen || flatMode}
    <div
      class="list-container simple-card"
      bind:this={listContainer}
      class:fly-mode={!flatMode}
      in:fly|local={{ y: 50 }}
      out:fade|local={{ duration: 100 }}
    >
      {#if $querySearch.isError}
        <span>Oups, un problème est survenu</span>
      {:else}
        {#each itemsFiltred as item, index (item._id || item.userId)}
          <div
            class="item selectable simple-card"
            class:active={isOpen && selectedIndex === index}
            animate:flip={{ duration: 200 }}
            on:click={() => handleSelect(item)}
            data-index={index}
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
          <Button
            on:click={() => {
              $querySearch.fetchNextPage()
              focus()
            }}
            depressed
          >
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

  .wrapper.reduced {
    min-width: 0px;
    width: 48px;
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
    max-height: 360px;
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
