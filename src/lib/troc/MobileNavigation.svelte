<script lang="ts">
  import { fly } from 'svelte/transition'
  import {
    mdiArrowLeft,
    mdiEarth,
    mdiPlus,
    mdiSwapHorizontal,
    mdiTagMultipleOutline,
  } from '@mdi/js'
  import { page, redirect } from '@roxi/routify'
  import { Tabs, Tab, Icon, Button } from 'svelte-materialify'

  import { isKeyboardOpen } from '$lib/store/layout'
  import logo from '$assets/logo'

  const TABS_TROCS = [
    { icon: { path: mdiEarth }, label: 'Découvrir', page: 'trocs' },
    { icon: logo, label: 'Mes trocs', href: './my', page: 'my' },
    {
      icon: { path: mdiPlus },
      label: 'Nouveau',
      href: './create',
      page: 'create',
    },
  ]
  let foundTabIndexTrocs = TABS_TROCS.findIndex(
    (tab) => $page.title === tab.page
  )
  let tabIndexTrocs = foundTabIndexTrocs > 0 ? foundTabIndexTrocs : 0
  function handleChangeTabsTrocs(event: { detail: number }) {
    tabIndexTrocs = event.detail
    $redirect(TABS_TROCS[tabIndexTrocs].href || '')
  }

  const TABS_TROC = [
    { icon: logo, label: 'Le troc', href: './my', page: 'my' },
    { icon: { path: mdiSwapHorizontal }, label: 'Activité', page: 'trocs' },
    {
      icon: { path: mdiTagMultipleOutline },
      label: 'Articles',
      href: './create',
      page: 'create',
    },
  ]
</script>

{#if !$isKeyboardOpen}
  <nav in:fly|local={{ y: 72 }}>
    {#if $page.title !== ':trocId'}
      <div class="overflow: hidden;">
        <Tabs
          icons
          grow
          class="secondary-color theme--dark"
          on:change={handleChangeTabsTrocs}
          value={tabIndexTrocs}
        >
          <div slot="tabs">
            {#each TABS_TROCS as tab}
              <Tab>
                <Icon {...tab.icon} />
                {tab.label}
              </Tab>
            {/each}
          </div>
        </Tabs>
      </div>
    {/if}

    {#if $page.title === ':trocId'}
      <div class="returnButton secondary-color">
        <Button
          fab
          class="secondary-color"
          on:click={() => window.history.back()}
        >
          <Icon path={mdiArrowLeft} />
        </Button>
      </div>
    {/if}

    {#if $page.title === ':trocId'}
      <div in:fly|local={{ y: 72, duration: 250 }}>
        <Tabs
          icons
          grow
          class="secondary-color theme--dark"
          on:change={handleChangeTabsTrocs}
          value={tabIndexTrocs}
        >
          <div slot="tabs">
            {#each TABS_TROC as tab}
              <Tab>
                <Icon {...tab.icon} />
                {tab.label}
              </Tab>
            {/each}
          </div>
        </Tabs>
      </div>
    {/if}
  </nav>
{/if}

<style>
  nav {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 72px;
  }

  .returnButton {
    position: fixed;
    bottom: 80px;
    left: 8px;
    border-radius: 50%;
  }
</style>
