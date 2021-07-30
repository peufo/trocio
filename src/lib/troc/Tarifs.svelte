<script lang="ts">
  import { Button } from 'svelte-materialify'
  import { url, params } from '@roxi/routify'

  import { troc, useCreateTarif } from '$lib/troc/store'
  import Tarif from '$lib/troc/Tarif.svelte'

  const queryCreateTarif = useCreateTarif()

  let tarifOpen: string | null = null
</script>

<div class="container pt-5">
  {#each $troc.tarif as tarif (tarif._id)}
    <Tarif
      {tarif}
      class="mb-3"
      open={tarifOpen === tarif._id}
      on:open={() => (tarifOpen = tarif._id)}
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
              tarifOpen = newTroc.tarif[newTroc.tarif.length - 1]._id
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
