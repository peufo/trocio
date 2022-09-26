<script lang="ts">
  import { slide } from 'svelte/transition'
  import { List, ListItem, Button } from 'svelte-materialify/src'

  import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons'
  import { isActive } from '@roxi/routify'

  import layout from '$lib/store/layout'
  import { user } from '$lib/user/store'
  import IconLink from '$lib/util/IconLink.svelte'
  import NavigationDrawer from '$lib/util/NavigationDrawer.svelte'
  import TrocMap from '$lib/troc/Map.svelte'
  import TrocSearch from '$lib/troc/Search.svelte'
  import SubTrocsList from '$lib/sub/TrocsList.svelte'

  export let active = true
  export let width = '360px'
  export let mobileMode = false

  let scrollY = 0

  $: drawerStyle = `
    width: ${width};
    height: ${$layout.innerHeight}px;
    padding-top: ${
      scrollY > $layout.headerHeight ? 0 : $layout.headerHeight - scrollY
    }px;
    overflow-y: hidden;
  `
</script>

<svelte:window bind:scrollY />

<NavigationDrawer {active} fixed style={drawerStyle}>
  <div class="pa-2 d-flex flex-column" style="gap: 1em; height: 100%;">
    <!-- MAP -->
    <div class="flex-shrink-0">
      <TrocMap on:clickMarker={() => mobileMode && (active = false)} />
    </div>

    <!-- SEARCH -->
    <div>
      {#if $isActive('/trocs/index')}
        <div class="simple-card " transition:slide|local>
          <TrocSearch />
        </div>
      {:else}
        <div transition:slide|local class="d-flex">
          <div class="flex-grow-1" />
          <a href="/trocs">
            <Button depressed>
              <IconLink icon={faSearch} class="mr-2" opacity />

              Chercher un troc
            </Button>
          </a>
        </div>
      {/if}
    </div>

    <!-- LIST HEADER -->
    <div class="d-flex justify-space-between">
      <h6>Mes trocs</h6>
      <a href="{!$user ? '/login?callback=' : ''}/trocs/create">
        <Button depressed class="primary-color">
          <IconLink icon={faPlus} class="mr-2" opacity />
          Organiser
        </Button>
      </a>
    </div>

    <!-- LIST -->
    {#if !$user}
      <div>
        <a href="/login?callback=/trocs">Connectez-vous</a> pour voir vos trocs.
      </div>
    {:else}
      <div
        class="simple-card flex-grow-1"
        style="overflow-y: auto; overflow-x: hidden;"
      >
        <SubTrocsList
          offset={22}
          on:click={() => mobileMode && (active = false)}
        />
      </div>
    {/if}
  </div>
</NavigationDrawer>
