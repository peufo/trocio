<script lang="ts">
  import { Card, CardTitle, Button, Icon } from 'svelte-materialify'

  import IconLink from '$lib/util/IconLink.svelte'
  import { useApi } from '$lib/api'
  import {
    faArrowRightToBracket,
    faArrowsDownToLine,
    faArrowUpFromBracket,
    faRightLeft,
  } from '@fortawesome/free-solid-svg-icons'
  import { mdiExport } from '@mdi/js'

  export let trocId: string

  interface ResumCount {
    payment: number
    positive: number
    negative: number
  }

  $: query = useApi<{ trocId: string }, ResumCount>([
    '/subscribes/resum/counts',
    { trocId },
  ])
</script>

{#if $query.data}
  <Card>
    <CardTitle class="ml-3 mr-4">
      <IconLink icon={faRightLeft} class="mr-4" />
      Transactions
      <div class="flex-grow-1" />
      {$query.data.payment}
    </CardTitle>
    <div class="pl-4 pr-4 pb-4 d-flex flex-column" style="gap: 0.5em;">
      <Button depressed>
        <IconLink
          icon={faArrowUpFromBracket}
          class="mr-2"
          size="1.2em"
          opacity
        />
        Solde{$query.data.positive > 1 ? 's' : ''} en faveur du client
        <div class="flex-grow-1" />
        {$query.data.positive}
      </Button>
      <Button depressed>
        <IconLink
          icon={faArrowRightToBracket}
          class="mr-2"
          size="1.2em"
          opacity
          style="transform: rotate(90deg);"
        />
        Solde{$query.data.negative > 1 ? 's' : ''} en votre faveur
        <div class="flex-grow-1" />
        {$query.data.negative}
      </Button>
      <ul>
        <li>23 Solde ouvert en votre faveur</li>
        <li>43 Solde ouvert en faveur des clients</li>
      </ul>
      <pre>{JSON.stringify($query.data)}</pre>
    </div>
  </Card>
{/if}
