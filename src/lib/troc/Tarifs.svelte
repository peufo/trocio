<script lang="ts">
  import { Button } from '$material'
  import { url, params, goto } from '@roxi/routify'
  import { api } from '$lib/api'
  import { troc } from '$lib/troc/store'
  import Tarif from '$lib/troc/Tarif.svelte'
  import { useMutation } from '@sveltestack/svelte-query'
  import type { TrocLookup, Tarif as ITarif } from 'types'

  const queryCreateTarif = useMutation(
    (data: { trocId: string } & Partial<ITarif>) =>
      api<{}, TrocLookup>(`/api/trocs/tarif`, {
        method: 'post',
        data,
        success: 'Nouveau tarif créé',
      }),
    {
      onSuccess: troc.set,
    }
  )

  // Nécéssaire pour la vitesse de réaction
  let tarif_selected: string | undefined
  $: tarif_selected = $params.tarif_selected || ''

  function handleOpen(tarifId?: string) {
    tarif_selected = tarifId
    $goto($url(), { ...$params, tarif_selected })
  }

  function handleClose() {
    tarif_selected = ''
    $goto($url(), { ...$params, tarif_selected })
  }
</script>

<div class="container pb-16">
  <h6 class="mb-5">Edition des tarifs</h6>

  {#each $troc.tarif as tarif (tarif._id)}
    <Tarif
      {tarif}
      class="mb-3"
      open={tarif_selected === tarif._id}
      on:open={() => handleOpen(tarif._id)}
      on:close={handleClose}
    />
  {/each}

  <div class="d-flex">
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
              $goto($url(), { ...$params, tarif_selected })
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
