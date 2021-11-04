<script lang="ts">
  import { params, url } from '@roxi/routify'
  import { createEventDispatcher } from 'svelte'
  import { List, ListItem, Divider, Icon } from 'svelte-materialify'
  import {
    faInfoCircle,
    faUsers,
    faCoins,
    faTag,
    faChartPie,
    faTasks,
    faCashRegister,
    faUsersCog,
    faChevronDown,
    faAngleDoubleLeft,
    faCubes,
  } from '@fortawesome/free-solid-svg-icons'
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'

  import { troc } from '$lib/troc/store'
  import layout from '$lib/store/layout'
  import logo from '$assets/logo'
  import IconLink from '$lib/util/IconLink.svelte'
  import NavigationDrawer from '$lib/util/NavigationDrawer.svelte'
  import ListGroup from '$lib/util/ListGroup.svelte'

  let width: string | undefined
  let mini = false
  /** width updated white according to props mini */
  export let realWidth = mini ? '56px' : width
  $: realWidth = mini ? '56px' : width
  let scrollY = 0

  const tabs = [
    { ref: 'info', label: 'Définition', icon: faInfoCircle },
    { ref: 'collab', label: 'Collaborateurs', icon: faUsersCog },
    {
      ref: 'tarif',
      label: 'Tarifications',
      icon: faCoins,
      groupActive: false,
    },
    { ref: 'tag', label: 'Etiquetage', icon: faTag },
    { ref: 'statistic', label: 'Statistique', icon: faChartPie },
    {
      ref: 'management',
      label: 'Gestion',
      icon: faTasks,
      groupActive: false,
      group: [
        {
          ref: 'management_users',
          label: 'Participants',
          icon: faUsers,
        },
        {
          ref: 'management_articles',
          label: 'Articles',
          icon: faCubes,
        },
      ],
    },
    { ref: 'cash_register', label: 'Caisse', icon: faCashRegister },
  ]

  const dispatch = createEventDispatcher()
</script>

<svelte:window bind:scrollY />

<div
  class="container"
  style="
    height: {$layout.innerHeight}px;
    transform: translateY({scrollY > $layout.headerHeight
    ? 0
    : $layout.headerHeight - scrollY}px);
    "
>
  <NavigationDrawer
    {mini}
    transition={() => ({ duration: 0, css: (t) => '' })}
    bind:width
  >
    <ListItem class="mt-5 text-overline" style="height: 60px;">
      <span slot="prepend">
        <Icon {...logo} size="1.3em" />
      </span>

      <span>{$troc?.name}</span>

      <span slot="subtitle">Administration</span>
    </ListItem>
    <Divider />
    <List nav>
      {#each tabs as tab}
        {#if tab.group}
          <a
            href={$url(`/admin/${tab.group[0].ref}`, {
              ...$params,
              tab_admin: tab.group[0].ref,
              // Double ref a cause de Tips qui écoute dessus
            })}
          >
            <ListGroup
              bind:active={tab.groupActive}
              offset={mini ? 0 : 32}
              class={tab.groupActive ? 'pb-2' : ''}
              activatorClass="mb-0"
            >
              <span slot="prepend">
                <IconLink icon={tab.icon} size="1.1em" />
              </span>
              <span slot="activator">{tab.label}</span>
              <span slot="append">
                <IconLink
                  icon={faChevronDown}
                  size="1.1em"
                  rotate={tab.groupActive ? 0 : -90}
                />
              </span>
              {#each tab.group as subTab}
                <a
                  href={$url(`/admin/${subTab.ref}`, {
                    ...$params,
                    tab_admin: subTab.ref,
                  })}
                >
                  <ListItem
                    active={$params.tab_admin === subTab.ref ||
                      (!$params.tab_admin && subTab.ref === 'info')}
                  >
                    <span slot="prepend">
                      <IconLink icon={subTab.icon} size="1.1em" />
                    </span>
                    {subTab.label}
                  </ListItem>
                </a>
              {/each}
            </ListGroup>
          </a>
        {:else}
          <a
            href={$url(`/admin/${tab.ref}`, { ...$params, tab_admin: tab.ref })}
          >
            <ListItem
              active={$params.tab_admin === tab.ref ||
                (!$params.tab_admin && tab.ref === 'info')}
            >
              <span slot="prepend">
                <IconLink icon={tab.icon} size="1.1em" />
              </span>
              {tab.label}
            </ListItem>
          </a>
        {/if}
      {/each}
    </List>

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

<style>
  .container {
    position: fixed;
    top: 0px;
  }
</style>
