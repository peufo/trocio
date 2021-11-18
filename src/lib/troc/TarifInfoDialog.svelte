<script lang="ts">
  import { Dialog, Button } from 'svelte-materialify'
  import type { Tarif } from 'types'
  import { renderAmount } from '$lib/utils'

  export let active = false
  export let tarif: Tarif | undefined
  export let modeAdmin = false
</script>

<Dialog bind:active class="pa-4">
  {#if tarif}
    <div>
      <h6>
        Le tarif <b>{tarif.name}</b>
        {modeAdmin ? 'est attribué au client' : 'vous est attribué'}
      </h6>

      <div class="mb-4">
        Nombre maximum d'article proposés :
        <b>{tarif.maxarticles}</b>
      </div>

      <div>
        Frais de traitement
        <span class="text-caption">( Appliqué au dépot de l'article )</span>
        :
      </div>

      <div class="mb-4 ml-4">
        {#each tarif.fee.sort((a, b) => a.price - b.price) as fee}
          A partir de <b>{renderAmount(fee.price)} </b>
          <i class="fas fa-arrow-right" />
          <b>{renderAmount(fee.value)}</b>
          <br />
        {/each}
      </div>

      <div>
        Marge de l'organisateur
        <span class="text-caption">( Appliqué à la vente de l'article )</span>
        :
        <b>{tarif.margin * 100}</b>%
      </div>

      <div />
      <br />

      <div class="d-flex">
        <div class="flex-grow-1" />
        <Button on:click={() => (active = false)}>ok merci</Button>
      </div>
    </div>
  {/if}
</Dialog>
