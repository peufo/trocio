<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import {
    Card,
    CardTitle,
    CardSubtitle,
    TextField,
    Button,
  } from 'svelte-materialify'
  import { faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons'
  import debounce from 'debounce'

  import IconLink from '$lib/util/IconLink.svelte'
  import type { UseInfiniteQueryStoreResult } from '@sveltestack/svelte-query'
  import Loader from './Loader.svelte'

  let klass = ''
  export { klass as class }

  export let title = 'Title'
  export let subtitle = ''
  /**
   * Si controlled === true,
   * open est controllé par le composant parent grâce aux évenements on:open et on:close
   */
  export let controlled = false
  export let open = false
  export let titleEditable = false

  /**
   * Gestion du champs de recherche
   */
  export let hasSearchInput = false
  export let inputElement: HTMLInputElement | undefined = undefined
  export let searchValue = ''
  export let searchValueDebounced = ''
  export let debounceDelay = 200

  /**
   * Gestion du chargement des données (fetchMore)
   */
  export let query:
    | undefined
    | UseInfiniteQueryStoreResult<any, any, any, any> = undefined

  let isSearchActive = false

  const dispath = createEventDispatcher()

  function handleOpen(event: any) {
    if (!open) dispath('open')
    if (!controlled) open = true
  }

  function handleClose(event: any) {
    event.stopPropagation()
    if (!open) return handleOpen(event)
    if (!controlled) open = false
    dispath('close')
  }

  function handleClickSearch() {
    isSearchActive = true
    inputElement?.focus()
  }

  function handleBlur(event: any) {
    if (event.target.value === '') isSearchActive = false
  }

  $: if (searchValue || true) handleSearch()

  function handleSearch() {
    debounceSearch(searchValue)
    dispath('search', searchValue)
  }

  const debounceSearch = debounce((value: string) => {
    searchValueDebounced = value
  }, debounceDelay)
</script>

<Card outlined hover={!open} class={klass}>
  <div on:click={handleOpen}>
    <CardTitle>
      <slot name="icon" />

      {#if titleEditable}
        <input value={title} on:input style="min-width: 100px;" />
      {:else}
        <span>
          {title}
        </span>
      {/if}

      <div style="flex-grow: 1;" />

      {#if hasSearchInput}
        <div
          class="mr-5"
          on:click={handleClickSearch}
          class:clickable={!isSearchActive}
        >
          <TextField
            placeholder="Chercher"
            clearable
            solo
            dense
            flat={!isSearchActive}
            bind:inputElement
            bind:value={searchValue}
            on:change
            on:input
            on:blur={handleBlur}
            style="
              transition: width 300ms;
              width: {isSearchActive ? '240px' : '45px'};
            "
          >
            <div slot="prepend">
              <IconLink icon={faSearch} size="1.1em" />
            </div>
          </TextField>
        </div>
      {/if}
      <IconLink
        icon={faChevronDown}
        clickable
        rotate={open ? 0 : -90}
        opacity
        on:click={handleClose}
      />
    </CardTitle>

    <CardSubtitle>
      <slot name="subtitle">
        {subtitle ? subtitle : ''}
      </slot>
    </CardSubtitle>

    {#if open}
      <div transition:slide|local>
        <slot />

        {#if query}
          {#if $query.isLoading || $query.isFetchingNextPage}
            <div class="text-center pa-16 text--opacity">
              <Loader />
            </div>
          {:else if !$query.data?.pages.flat().length}
            <div class="text-center pa-16 text--opacity">Aucun élément</div>
          {:else if $query.hasNextPage}
            <div class="d-flex pa-2">
              <div class="flex-grow-1" />
              <Button
                depressed
                on:click={() => query && $query.fetchNextPage()}
              >
                Plus de résultats
              </Button>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</Card>
