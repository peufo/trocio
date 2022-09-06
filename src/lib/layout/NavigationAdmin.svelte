<script lang="ts">
  import { params, url, isActive } from '@roxi/routify'
  import { createEventDispatcher } from 'svelte'
  import { List, ListItem, Divider, Button, Overlay } from 'svelte-materialify'
  import {
    faHouseChimney,
    faInfoCircle,
    faUsers,
    faCubes,
    faCoins,
    faTag,
    faChartPie,
    faCashRegister,
    faAngleDoubleLeft,
    faAngleDoubleRight,
  } from '@fortawesome/free-solid-svg-icons'
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'

  import { troc } from '$lib/troc/store'
  import layout, { isMobile } from '$lib/store/layout'
  import IconLink from '$lib/util/IconLink.svelte'
  import NavigationDrawer from '$lib/util/NavigationDrawer.svelte'

  let width: string | undefined
  let mini = $isMobile

  $: miniWidth = $isMobile ? '0px' : '56px'

  /** width updated white according to props mini */
  export let realWidth = mini ? miniWidth : width
  $: realWidth = mini ? miniWidth : width
  let scrollY = 0

  const tabs = [
    { ref: 'home', label: $troc.name, icon: faHouseChimney, isIndex: true },
    { ref: 'edit', label: 'Définition', icon: faInfoCircle },
    { ref: 'tarif', label: 'Tarifications', icon: faCoins },
    { ref: 'tag', label: 'Etiquetage', icon: faTag },
    { ref: 'statistic', label: 'Statistiques', icon: faChartPie },
    { ref: 'management_users', label: 'Participants', icon: faUsers },
    { ref: 'management_articles', label: 'Articles', icon: faCubes },
    { ref: 'cash_register', label: 'Caisse', icon: faCashRegister },
  ]

  const dispatch = createEventDispatcher()

  $: offsetY =
    scrollY > $layout.headerHeight ? 0 : $layout.headerHeight - scrollY

  function handleClickLink() {
    if ($isMobile) mini = true
  }
</script>

<svelte:window bind:scrollY />

<div
  style="
    position: fixed;
    top: 0px;
    z-index: 2;
    height: {$layout.innerHeight - offsetY}px;
    transform: translateY({offsetY}px);
  "
>
  <NavigationDrawer
    {mini}
    transition={() => ({ duration: 0, css: (t) => '' })}
    bind:width
    classContent="d-flex flex-column"
    {miniWidth}
  >
    <List nav>
      {#each tabs as tab}
        <a
          href={$url(`/admin/${tab.ref}`, { ...$params })}
          on:click={handleClickLink}
        >
          <ListItem
            active={$isActive(`/admin/${tab.ref}`) ||
              (tab.isIndex && $isActive('/admin/index'))}
          >
            <span slot="prepend">
              <IconLink icon={tab.icon} size="1.1em" />
            </span>
            {tab.label}
          </ListItem>
        </a>
      {/each}
    </List>

    <div class="flex-grow-1" />
    <Divider />

    <List nav>
      <ListItem on:click={() => dispatch('openTips')}>
        <span slot="prepend">
          <IconLink icon={faQuestionCircle} size="1.1em" />
        </span>
        Aide
      </ListItem>

      <ListItem on:click={() => (mini = !mini)}>
        <span slot="prepend">
          <IconLink
            icon={faAngleDoubleLeft}
            size="1.1em"
            rotate={mini ? 180 : 0}
          />
        </span>
        Reduire le menu
      </ListItem>
    </List>
  </NavigationDrawer>
</div>

{#if $isMobile}
  <div class="icon-button secondary-color">
    <Button fab on:click={() => (mini = false)}>
      <IconLink icon={faAngleDoubleRight} />
    </Button>
  </div>

  <Overlay
    active={!mini}
    index={1}
    opacity={0.7}
    on:click={() => (mini = true)}
  />
{/if}

<style>
  .icon-button {
    position: fixed;
    left: 0.5em;
    bottom: 0.5em;
    z-index: 1;
    border-radius: 50%;
    padding: 2px;
  }
</style>
