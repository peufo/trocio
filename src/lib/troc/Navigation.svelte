<script lang="ts">
  import { slide } from 'svelte/transition'
  import { List, ListItem, Button } from 'svelte-materialify'

  import { faSearch, faPlus } from '@fortawesome/free-solid-svg-icons'
  import { isActive } from '@roxi/routify'

  import type { ITimeFilter } from 'types'
  import { query } from '$lib/troc/store'
  import layout from '$lib/store/layout'
  import { user } from '$lib/user/store'
  import IconLink from '$lib/util/IconLink.svelte'
  import NavigationDrawer from '$lib/util/NavigationDrawer.svelte'
  import TrocMap from '$lib/troc/Map.svelte'
  import TrocSearch from '$lib/troc/Search.svelte'
  import UserSubscribes from '$lib/troc/UserSubscribes.svelte'

  export let active = true
  export let width = '360px'
  export let mobileMode = false

  let scrollY = 0

  let search = ''
  let timeFilter: ITimeFilter = {}
  let mapFilter = {}

  $: $query = { search, ...timeFilter, ...mapFilter }
</script>

<svelte:window bind:scrollY />

<NavigationDrawer
  {active}
  transition={() => ({ duration: 0, css: (t) => '' })}
  fixed
  style="
    width: {width};
    height: {$layout.innerHeight}px;
    padding-top: {scrollY > $layout.headerHeight
    ? 0
    : $layout.headerHeight - scrollY}px;
  "
>
  <div class="pa-2">
    <TrocMap
      bind:mapFilter
      on:clickMarker={() => mobileMode && (active = false)}
    />
  </div>

  <List nav>
    {#if $isActive('/trocs/index')}
      <div transition:slide|local class="border">
        <TrocSearch bind:search bind:timeFilter />
      </div>
    {:else}
      <div transition:slide|local>
        <a href="/trocs">
          <ListItem>
            <span slot="prepend">
              <IconLink icon={faSearch} />
            </span>
            Recherche
          </ListItem>
        </a>
      </div>
    {/if}

    <div class="pt-4 pb-3 d-flex justify-space-between">
      <h6>Mes trocs</h6>
      <a href="{!$user ? '/login?callback=' : ''}/trocs/create">
        <Button>
          <IconLink icon={faPlus} class="mr-2" opacity />
          Organiser
        </Button>
      </a>
    </div>

    {#if !$user}
      <ListItem disabled>
        <div class="text--disabled text-center">
          Connectez-vous pour voir vos trocs.
        </div>
      </ListItem>
    {:else}
      <UserSubscribes
        offset={22}
        on:click={() => mobileMode && (active = false)}
      />
    {/if}
  </List>
</NavigationDrawer>

<style>
  .border {
    border: solid 1px var(--theme-text-fields-border);
    border-radius: 5px;
  }
</style>
