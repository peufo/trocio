<script lang="ts">
  import { Dialog } from 'svelte-materialify'

  import { Tarif } from 'types'
  import { trocDetails as details } from '$lib/stores.js'

  export let dialogActive
  export let tarif: Tarif = 

</script>

<Dialog bind:active={dialogActive} class="pa-4">
  {#if $details && $details.tarif}
    <h4>Vous êtes soumis au tarif <b>{$details.tarif.name}</b>:</h4>

    <h5>Nombre maximum d'article proposés</h5>
    <br />
    <div style="text-align: center;">
      <b>{$details.tarif.maxarticles}</b> <i class="fas fa-cube" />
    </div>
    <br /><br />

    <h5>
      Frais de traitement
      <span class="w3-small w3-opacity">Appliqué au dépot de l'article</span>
    </h5>
    <br />
    <div style="text-align: center;">
      {#each $details.tarif.fee.sort((a, b) => a.price - b.price) as fee}
        A partir de <b>{fee.price.toFixed(2)} </b><i
          class="fas fa-arrow-right"
        /> <b>{fee.value.toFixed(2)}</b>
        <br />
      {/each}
    </div>
    <br /><br />

    <h5>
      Marge
      <span class="w3-small w3-opacity">Appliquée à la vente de l'article</span>
    </h5>
    <br />
    <div style="text-align: center;">
      <b>{$details.tarif.margin * 100}</b> <i class="fas fa-percent" />
    </div>
    <br />
  {/if}
</Dialog>
