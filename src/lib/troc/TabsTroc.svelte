<script lang="ts">
  import { mdiSwapHorizontal, mdiTagMultipleOutline } from "@mdi/js";
  import { Tabs, Tab, Icon } from "$lib/material";

  import logo from "$lib/assets/logo";
  import { page } from "$app/state";
  import { goto } from "$app/navigation";

  const TABS = [
    { icon: logo, label: "Le troc", href: "./", routeId: "/trocs/[trocId]" },
    {
      icon: { path: mdiSwapHorizontal },
      label: "Activité",
      href: "./activity",
      routeId: "/trocs/[trocId]/activity",
    },
    {
      icon: { path: mdiTagMultipleOutline },
      label: "Articles",
      href: "./articles",
      routeId: "/trocs/[trocId]/articles",
    },
  ];

  let foundTabIndex = TABS.findIndex((tab) => page.route.id === tab.routeId);

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
