<script lang="ts">
  import { params, url, page } from '@roxi/routify'
  import { createEventDispatcher } from 'svelte'
  import {
    NavigationDrawer,
    List,
    ListGroup,
    ListItem,
    Divider,
    Icon,
  } from 'svelte-materialify'
  import {
    faInfoCircle,
    faUsers,
    faCoins,
    faTag,
    faChartPie,
    faTasks,
    faCashRegister,
    faEdit,
    faUsersCog,
    faChevronDown,
    faAngleDoubleLeft,
  } from '@fortawesome/free-solid-svg-icons'
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'

  import type { Troc } from 'types'
  import { useQueryClient } from '@sveltestack/svelte-query'
  import layout from '$lib/store/layout'
  import logo from '$assets/logo'
  import IconLink from '$lib/util/IconLink.svelte'
  import { each } from 'svelte/internal'

  let width
  let mini = false
  /** width updated white according to props mini */
  export let realWidth = mini ? '56px' : width
  $: realWidth = mini ? '56px' : width
  let scrollY = 0

  const queryClient = useQueryClient()
  const troc = queryClient.getQueryData<Troc>(['troc', $params.trocId])

  const tabs = [
    { ref: 'info', label: 'Informations', icon: faInfoCircle },
    { ref: 'collab', label: 'Collaborateurs', icon: faUsersCog },
    {
      ref: 'tarif',
      label: 'Tarifications',
      icon: faCoins,
      groupActive: false,
      group: [
        { ref: 'tarif_edition', label: 'Edition', icon: faEdit },
        { ref: 'tarif_attribution', label: 'Attribution', icon: faUsers },
      ],
    },
    { ref: 'tag', label: 'Etiquetage', icon: faTag },
    { ref: 'statistic', label: 'Statistique', icon: faChartPie },
    { ref: 'managment', label: 'Gestion', icon: faTasks },
    { ref: 'cashier', label: 'Caisse', icon: faCashRegister },
  ]

  $: if (mini && !$params.tab_admin?.includes('tarif'))
    tabs[2].groupActive = false

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

      <span>{troc.name}</span>

      <span slot="subtitle">Administration</span>
    </ListItem>
    <Divider />
    <List nav>
      {#each tabs as tab}
        {#if tab.group}
          <a href={$url('/admin', { ...$params, tab_admin: tab.group[0].ref })}>
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
                <a href={$url('/admin', { ...$params, tab_admin: subTab.ref })}>
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
          <a href={$url('/admin', { ...$params, tab_admin: tab.ref })}>
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
