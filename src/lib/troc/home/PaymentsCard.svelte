<script lang="ts">
  import { Card, CardTitle } from 'svelte-materialify'
  import { faCashRegister } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  import { useApi } from '$lib/api'

  export let trocId: string

  $: query = useApi(['/subscribes/resum/counts', { trocId }])
</script>

<Card>
  <CardTitle>
    <IconLink icon={faCashRegister} class="mr-4" />
    321 transaction
  </CardTitle>
  <div class="pl-4 pr-4 pb-4">
    <ul>
      <li>23 Solde ouvert en votre faveur</li>
      <li>43 Solde ouvert en faveur des clients</li>
    </ul>
    <pre>{JSON.stringify($query.data)}</pre>
  </div>
</Card>
