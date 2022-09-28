<script lang="ts">
  import { url } from '@roxi/routify'
  import { Button, Card, CardTitle, Icon } from '$material'
  import {
    faCoins,
    faTag,
    faChartPie,
    faCashRegister,
  } from '@fortawesome/free-solid-svg-icons'
  import { mdiCogs } from '@mdi/js'

  import IconLink from '$lib/util/IconLink.svelte'

  export let trocId: string

  const links = [
    { ref: 'tarif', label: 'Tarifications', icon: faCoins },
    { ref: 'tag', label: 'Étiquetage', icon: faTag },
    { ref: 'statistic', label: 'Statistiques', icon: faChartPie },
    { ref: 'cash_register', label: 'Caisse', icon: faCashRegister },
  ]
</script>

<Card>
  <CardTitle>
    <Icon path={mdiCogs} class="mr-2" />
    Autres liens
  </CardTitle>

  <div class="pa-4 d-flex flex-column" style="gap: 0.5em;">
    {#each links as link}
      <a href={$url(`/admin/${link.ref}`, { trocId })}>
        <Button depressed style="width: 100%;">
          <IconLink icon={link.icon} class="mr-2" opacity />
          {link.label}
          <div class="flex-grow-1" />
        </Button>
      </a>
    {/each}
  </div>
</Card>
