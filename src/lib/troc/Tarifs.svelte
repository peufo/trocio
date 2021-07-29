<script lang="ts">
  import { Button } from 'svelte-materialify'
  import { url, params } from '@roxi/routify'

  import { troc } from '$lib/troc/store'
  import Tarif from '$lib/troc/Tarif.svelte'

  function removeTarif(i) {
    console.log('remove a tarif')
    /*
        $troc.tarif = [...$troc.tarif.slice(0, i), ...$troc.tarif.slice(i + 1)]
        changeFlag = true
        */
  }
</script>

<div class="container pt-5">
  {#each $troc.tarif as tarif, i}
    <Tarif
      bind:name={tarif.name}
      bind:apply={tarif.apply}
      bind:margin={tarif.margin}
      bind:fee={tarif.fee}
      bind:maxarticles={tarif.maxarticles}
      bind:bydefault={tarif.bydefault}
      on:remove={() => removeTarif(i)}
      on:selectUser={() => console.log('selectUser')}
      on:removeUser={() => console.log('removeUser')}
    />
  {/each}

  <br />

  <div class="d-flex">
    <a href={$url('/admin', { ...$params, tab_admin: 'tarif_attribution' })}>
      <Button depressed>Gerer l'attribution des tarifs</Button>
    </a>
    <div class="flex-grow-1" />
    <Button depressed on:click={() => console.log('add a tarif')}>
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
