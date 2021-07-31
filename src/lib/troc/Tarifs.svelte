<script lang="ts">
  import { Button } from 'svelte-materialify'
  import { url, params, goto } from '@roxi/routify'

  import { troc, useCreateTarif } from '$lib/troc/store'
  import Tarif from '$lib/troc/Tarif.svelte'

  const queryCreateTarif = useCreateTarif()

  // Nécéssaire pour la vitesse de réaction
  $: tarif_selected = $params.tarif_selected
</script>

<div class="container pt-5">
  {#each $troc.tarif as tarif (tarif._id)}
    <Tarif
      {tarif}
      class="mb-3"
      open={tarif_selected === tarif._id}
      on:open={() => {
        tarif_selected = tarif._id
        $goto('/admin', { ...$params, tarif_selected })
      }}
    />
  {/each}

  <div class="d-flex">
    <a href={$url('/admin', { ...$params, tab_admin: 'tarif_attribution' })}>
      <Button depressed>Gerer l'attribution des tarifs</Button>
    </a>
    <div class="flex-grow-1" />
    <Button
      disabled={$queryCreateTarif.isLoading}
      depressed
      on:click={() =>
        $queryCreateTarif.mutate(
          {
            trocId: $troc._id,
            name: 'Nouveau tarif',
          },
          {
            onSuccess: (newTroc) => {
              tarif_selected = newTroc.tarif[newTroc.tarif.length - 1]._id
              $goto('/admin', { ...$params, tarif_selected })
            },
          }
        )}
    >
      +1 tarif
    </Button>
  </div>
</div>

<style>
  .container {
    max-width: 700px;
    margin: auto;
  }
</style>
