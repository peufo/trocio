<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fly } from 'svelte/transition'
  import { TextField, List, ListItem } from 'svelte-materialify'
  import debounce from 'debounce'

  import Loader from '$lib/util/Loader.svelte'
  import { useApi } from '$lib/api'
  import type { User } from 'types'

  export let label = 'Chercher un utilisateur'
  export let inputElement: any = undefined
  export let searchValue = ''
  export let exepted: string[] = []
  export let selectedItem: any = null
  export let modeSelect = false
  let selectedIndex = 0
  let focus = false

  const dispatch = createEventDispatcher()
  $: querySearch = useApi<{ q: string }, User[]>([
    '/users/search',
    { q: searchValue },
  ])
  $: items = $querySearch.data ? $querySearch.data.flat() : []
  $: itemsFiltred = items.filter((user) => !exepted.includes(user._id))

  const handleSearch = debounce(() => {
    searchValue = inputElement.value
  }, 200)

  //TODO: Transformer pour aussi servire au article
  //1. Utilisé ._id au lieu de .mail
  //2. remplacer user par item
  //3. Utilisé <slot> pour la représentation

  function select(item: any) {
    selectedItem = item
    dispatch('select', item)
    inputElement.value = modeSelect ? item.name : ''
    inputElement.blur()
  }

  function handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
        if (selectedIndex > -1) {
          select(itemsFiltred[selectedIndex])
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
    if (modeSelect) {
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
  <TextField
    bind:inputElement
    on:keydown={handleKeydown}
    on:input={handleSearch}
    on:focus={handleFocus}
    on:blur={handleBlur}
    autocomplete="off"
    placeholder={modeSelect && !!selectedItem ? ' ' : ''}
    {...$$restProps}
  >
    {label}
  </TextField>

  {#if focus}
    <div class="items elevation-5 rounded" in:fly={{ y: 50 }}>
      <List dense>
        {#if $querySearch.isLoading}
          <ListItem disabled><Loader /></ListItem>
        {:else if $querySearch.isError}
          <ListItem disabled>Oups, un problème est survenu</ListItem>
        {:else}
          {#each itemsFiltred as item, index}
            <ListItem
              active={selectedIndex === index}
              on:click={() => select(item)}
            >
              {item.name}
              <span slot="subtitle">{item.mail}</span>
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
