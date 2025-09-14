<script lang="ts">
  import { mdiEarth, mdiPlus } from "@mdi/js";
  import { Tabs, Tab, Icon } from "$lib/material";

  import logo from "$lib/assets/logo";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  const TABS = [
    { icon: { path: mdiEarth }, label: "Découvrir", href: "/trocs" },
    { icon: logo, label: "Mes trocs", href: "/trocs/my" },
    {
      icon: { path: mdiPlus },
      label: "Organiser",
      href: "/trocs/create",
    },
  ];
  let foundTabIndex = TABS.findIndex((tab) => page.route.id === tab.href);
  let tabIndex = foundTabIndex > 0 ? foundTabIndex : 0;
  function handleChangeTabsTrocs(event: { detail: number }) {
    tabIndex = event.detail;
    goto(TABS[tabIndex].href);
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
