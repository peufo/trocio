<script lang="ts">
  import { mdiEarth, mdiPlus } from '@mdi/js'
  import { isActive, redirect } from '@roxi/routify'
  import { Tabs, Tab, Icon } from '$material'

  import logo from '$assets/logo'

  const TABS = [
    { icon: { path: mdiEarth }, label: 'Découvrir', href: './index' },
    { icon: logo, label: 'Mes trocs', href: './my' },
    {
      icon: { path: mdiPlus },
      label: 'Organiser',
      href: './create',
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
