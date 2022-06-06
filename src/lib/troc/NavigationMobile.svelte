<script lang="ts">
  import { mdiMagnify, mdiPlus } from '@mdi/js'
  import { redirect } from '@roxi/routify'

  import { Tabs, Tab, Icon } from 'svelte-materialify'
  import logo from '$assets/logo'

  const TABS = [
    { icon: { path: mdiMagnify }, label: 'Découvrir', href: 'discover' },
    { icon: logo, label: 'Mes trocs', href: 'my' },
    { icon: { path: mdiPlus }, label: 'Nouveau', href: 'create' },
  ]

  function handleChange(event: { detail: number }) {
    const tabIndex = event.detail
    const href = `/trocs/${TABS[tabIndex].href}`
    $redirect(href, {})
  }
</script>

<nav>
  <Tabs icons grow class="secondary-color theme--dark" on:change={handleChange}>
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
