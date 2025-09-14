<script lang="ts">
  import { Button, Card, CardTitle } from "$lib/material";
  import {
    faCoins,
    faTag,
    faChartPie,
  } from "@fortawesome/free-solid-svg-icons";

  import IconLink from "$lib/util/IconLink.svelte";
  import { param } from "$lib/param";

  export let trocId: string;

  const links = [
    { ref: "tarif", label: "Tarifications", icon: faCoins },
    { ref: "tag", label: "Étiquetage", icon: faTag },
    { ref: "statistic", label: "Statistiques", icon: faChartPie },
  ];
</script>

<Card>
  <CardTitle>Autres liens</CardTitle>

  <div class="pa-4 d-flex flex-column" style="gap: 0.5em;">
    {#each links as link}
      <a href="/admin/{link.ref}{$param.withOnly({ trocId })}">
        <Button depressed style="width: 100%;">
          <IconLink icon={link.icon} class="mr-2" opacity />
          {link.label}
          <div class="flex-grow-1"></div>
        </Button>
      </a>
    {/each}
  </div>
</Card>
