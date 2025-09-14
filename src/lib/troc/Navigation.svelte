<script lang="ts">
  import { fade, slide } from "svelte/transition";
  import { Button, NavigationDrawer } from "$lib/material";

  import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";

  import { layout } from "$lib/store/layout";
  import { user } from "$lib/user/store";
  import IconLink from "$lib/util/IconLink.svelte";
  import TrocMap from "$lib/troc/Map.svelte";
  import TrocSearch from "$lib/troc/Search.svelte";
  import SubTrocsList from "$lib/sub/TrocsList.svelte";
  import { page } from "$app/state";

  export let active = true;
  export let width = "360px";
  export let mobileMode = false;

  let scrollY = 0;

  $: drawerStyle = `
    width: ${width};
    height: ${$layout.innerHeight}px;
    padding-top: ${
      scrollY > $layout.headerHeight ? 0 : $layout.headerHeight - scrollY
    }px;
    overflow-y: hidden;
  `;
</script>

<svelte:window bind:scrollY />

<NavigationDrawer {active} fixed style={drawerStyle}>
  <div class="pa-2 d-flex flex-column" style="gap: 1em; height: 100%;">
    <!-- MAP -->
    <div class="flex-shrink-0">
      <TrocMap on:clickMarker={() => mobileMode && (active = false)} />
    </div>

    <!-- LIST HEADER -->
    <div>
      <!-- SEARCH FORM -->
      {#if page.route.id === "/trocs"}
        <div transition:slide|local style="padding-bottom: 1em;">
          <div class="simple-card">
            <TrocSearch />
          </div>
        </div>
      {/if}

      <div class="d-flex">
        {#if page.route.id !== "/trocs"}
          <a
            href="/trocs"
            in:fade|local={{ duration: 100, delay: 100 }}
            out:fade|local={{ duration: 100 }}
          >
            <Button depressed>
              <IconLink icon={faSearch} class="mr-2" opacity />
              Chercher
            </Button>
          </a>
        {/if}
        <div class="flex-grow-1"></div>

        <a href="{!$user ? '/login?callback=' : ''}/trocs/create">
          <Button depressed class="secondary-color">
            <IconLink icon={faPlus} class="mr-2" opacity />
            Organiser
          </Button>
        </a>
      </div>
    </div>
    <!-- LIST -->
    {#if !$user}
      <div class="pa-4 text-center">
        <a href="/login?callback=/trocs">Connectez-vous</a> pour voir vos trocs.
      </div>
    {:else}
      <div class="simple-card troc-list-container">
        <SubTrocsList on:click={() => mobileMode && (active = false)} />
      </div>
    {/if}
  </div>
</NavigationDrawer>

<style>
  .troc-list-container {
    flex-grow: 1;
    overflow-y: auto;
    overflow-x: hidden;
    background: var(--theme-surface);
  }
</style>
