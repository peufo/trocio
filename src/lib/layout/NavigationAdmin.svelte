<script lang="ts">
  import { params, url } from '@roxi/routify'
  import { createEventDispatcher } from 'svelte'
  import {
    NavigationDrawer,
    List,
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
    faEraser,
    faCashRegister,
  } from '@fortawesome/free-solid-svg-icons'
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'

  import type { Troc } from 'types'
  import { useQueryClient } from '@sveltestack/svelte-query'

  import layout from '$lib/store/layout'
  import logo from '$assets/logo'
  import IconLink from '$lib/util/IconLink.svelte'
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
    { ref: 'collab', label: 'Collaborateurs', icon: faUsers },
    { ref: 'tarif', label: 'Tarifications', icon: faCoins },
    { ref: 'tag', label: 'Etiquetage', icon: faTag },
    { ref: 'statistic', label: 'Statistique', icon: faChartPie },
    { ref: 'managment', label: 'Gestion', icon: faEraser },
    { ref: 'cashier', label: 'Caisse', icon: faCashRegister },
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
  on:mouseenter={() => (mini = false)}
  on:mouseleave={() => (mini = true)}
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
      {#each tabs as tab, i}
        <a href={$url($url(), { ...$params, tab_admin: tab.ref })}>
          <ListItem>
            <span slot="prepend">
              <IconLink icon={tab.icon} size="1.1em" />
            </span>
            {tab.label}
          </ListItem>
        </a>
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
    </List>
  </NavigationDrawer>
</div>

<style>
  .container {
    position: fixed;
    top: 0px;
  }
</style>
