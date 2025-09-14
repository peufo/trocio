<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import {
    Card,
    CardTitle,
    CardSubtitle,
    TextField,
    Button,
  } from "$lib/material";
  import { faChevronDown, faSearch } from "@fortawesome/free-solid-svg-icons";
  import debounce from "debounce";

  import IconLink from "$lib/util/IconLink.svelte";
  import type { InfiniteQueryObserverResult } from "@tanstack/svelte-query";
  import Loader from "./Loader.svelte";

  let klass = "";
  export { klass as class };

  export let title = "Title";
  export let subtitle = "";
  /**
   * Si controlled === true,
   * open est controllé par le composant parent grâce aux évenements on:open et on:close
   */
  export let controlled = false;
  export let open = false;
  export let titleEditable = false;

  /**
   * Gestion du champs de recherche
   */
  export let hasSearchInput = false;
  export let inputElement: HTMLInputElement | undefined = undefined;
  export let searchValue = "";
  export let searchValueDebounced = "";
  export let debounceDelay = 200;

  /**
   * Gestion du chargement des données (fetchMore)
   */
  export let query: undefined | InfiniteQueryObserverResult = undefined;

  let isSearchActive = false;

  const dispath = createEventDispatcher<{
    close: void;
    open: void;
    search: string;
  }>();

  function handleOpen() {
    if (!open) dispath("open");
    if (!controlled) open = true;
  }

  function handleClose(event: Event) {
    event.stopPropagation();
    if (!open) return handleOpen();
    if (!controlled) open = false;
    dispath("close");
  }

  function handleClickSearch() {
    isSearchActive = true;
    inputElement?.focus();
  }

  function handleBlur(event: any) {
    if (event.target.value === "") isSearchActive = false;
  }

  $: if (searchValue || true) handleSearch();

  function handleSearch() {
    debounceSearch(searchValue);
    dispath("search", searchValue);
  }

  const debounceSearch = debounce((value: string) => {
    searchValueDebounced = value;
  }, debounceDelay);
</script>

<Card outlined hover={!open} class={klass}>
  <div
    role="button"
    tabindex="0"
    on:click={handleOpen}
    on:keydown={({ key }) => key === "space" && handleOpen()}
  >
    <CardTitle style="gap: 1em;">
      <slot name="icon" />

      {#if titleEditable}
        <form on:submit|preventDefault>
          <input value={title} on:input style="min-width: 100px;" />
        </form>
      {:else}
        <span>
          {title}
        </span>
      {/if}

      <div class="flex-grow-1"></div>

      {#if hasSearchInput}
        <div
          role="button"
          tabindex="0"
          class="mr-5"
          on:click={handleClickSearch}
          on:keydown={() => {}}
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

      <slot name="actions" />

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
        {subtitle ? subtitle : ""}
      </slot>
    </CardSubtitle>

    {#if open}
      <div transition:slide|local>
        <slot />

        {#if query}
          {#if query.isFetching}
            <div class="text-center pa-16 text--opacity">
              <Loader />
            </div>
          {:else if query.hasNextPage}
            <div class="d-flex pa-2">
              <div class="flex-grow-1"></div>
              <Button depressed on:click={() => query && query.fetchNextPage()}>
                Plus de résultats
              </Button>
            </div>
          {:else}
            <div class="text-center pa-16 text--opacity">Aucun élément</div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</Card>
