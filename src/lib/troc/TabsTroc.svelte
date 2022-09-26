<script lang="ts">
  import { mdiSwapHorizontal, mdiTagMultipleOutline } from '@mdi/js'
  import { page, isActive, redirect } from '@roxi/routify'
  import { Tabs, Tab, Icon } from 'svelte-materialify/src'

  import logo from '$assets/logo'

  const TABS = [
    { icon: logo, label: 'Le troc', href: './index' },
    {
      icon: { path: mdiSwapHorizontal },
      label: 'Activité',
      href: './activity',
    },
    {
      icon: { path: mdiTagMultipleOutline },
      label: 'Articles',
      href: './articles',
    },
  ]

  let foundTabIndex = TABS.findIndex((tab) => $isActive(tab.href))

  let tabIndex = foundTabIndex > 0 ? foundTabIndex : 0
  function handleChangeTabsTrocs(event: { detail: number }) {
    tabIndex = event.detail
    $redirect(TABS[tabIndex].href || '')
  }
</script>

<Tabs
  icons
  grow
  class="elevation-6"
  on:change={handleChangeTabsTrocs}
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
