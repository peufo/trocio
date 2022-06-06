<script lang="ts">
  import { mdiEarth, mdiPlus } from '@mdi/js'
  import { page, redirect } from '@roxi/routify'

  import { Tabs, Tab, Icon } from 'svelte-materialify'
  import logo from '$assets/logo'

  const TABS = [
    { icon: { path: mdiEarth }, label: 'Découvrir' },
    { icon: logo, label: 'Mes trocs', href: 'my' },
    { icon: { path: mdiPlus }, label: 'Nouveau', href: 'create' },
  ]
  const foundTabIndex = TABS.findIndex((tab) => $page.title === tab.href)
  let tabIndex = foundTabIndex > 0 ? foundTabIndex : 0

  function handleChange(event: { detail: number }) {
    tabIndex = event.detail
    $redirect(`./${TABS[tabIndex].href || ''}`)
  }
</script>

<nav>
  <Tabs
    icons
    grow
    class="secondary-color theme--dark"
    on:change={handleChange}
    value={tabIndex}
  >
    <div slot="tabs">
      {#each TABS as tab}
        <Tab>
          <Icon {...tab.icon} />
          {tab.label}
        </Tab>
      {/each}
    </div>
  </Tabs>
</nav>

<style>
  nav {
    position: fixed;
    bottom: 0;
    width: 100%;
  }
</style>
