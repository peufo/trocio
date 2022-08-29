<script lang="ts">
  import { Dialog, Button } from 'svelte-materialify'
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  import type { Tarif } from 'types'
  import { renderAmount } from '$lib/utils'

  export let active = false
  export let tarif: Tarif | undefined
  export let modeAdmin = false

  function handleClick() {
    active = true
  }
</script>

<Button text dense on:click={handleClick}>
  <IconLink icon={faQuestionCircle} size="1.1em" class="mr-2" />
  Tarif
</Button>

<Dialog bind:active class="pa-4">
  {#if tarif}
    <div>
      <div class="d-flex flex-column" style="gap: 1.2em;">
        <h6>
          Le tarif <b>{tarif.name}</b>
          {modeAdmin ? 'est attribué au client' : 'vous est attribué'}
        </h6>

        <div>
          <div class="text-caption">Nombre maximum d'article proposés</div>
          <b>{tarif.maxarticles}</b>
        </div>

        <div>
          <div class="text-caption">
            Frais de traitement appliqué au dépot de l'article
          </div>

          <div>
            {#each tarif.fee.sort((a, b) => a.price - b.price) as fee}
              A partir de <b>{renderAmount(fee.price)} </b>
              <i class="fas fa-arrow-right" />
              <b>{renderAmount(fee.value)}</b>
              <br />
            {/each}
          </div>
        </div>

        <div>
          <div class="text-caption">
            Marge de l'organisateur appliqué à la vente de l'article
          </div>

          <b>{tarif.margin * 100}</b>%
        </div>
      </div>

      <div class="d-flex mt-4">
        <div class="text-caption">
          Cette tarification est définit et attribué par l'organisateur
        </div>

        <div class="flex-grow-1" />
        <Button on:click={() => (active = false)}>ok merci</Button>
      </div>
    </div>
  {/if}
</Dialog>
