<script lang="ts">
  import { fade } from 'svelte/transition'
  import QrCode from 'qrcode'
  import { faCashRegister } from '@fortawesome/free-solid-svg-icons'

  import { Button } from '$material'
  import IconLink from '$lib/util/IconLink.svelte'
  import { isMobile } from '$lib/store/layout'

  export let peerToken: string

  let qrcode = ''
  let isOpen = false

  async function handleClick() {
    const scannerURL = `https://${location.host}/scanner?token=${peerToken}`
    console.log(scannerURL)
    qrcode = await QrCode.toDataURL(scannerURL)
    isOpen = true
  }
</script>

<div class="flex-column">
  {#if isOpen}
    <div in:fade|local style="text-align: center;">
      <img src={qrcode} alt="Code QR de connection mobile" />
      <p class="text-caption">
        Connecter votre smartphone à cette caisse en scannant ce code QR.
      </p>
    </div>
  {:else}
    <div class="flex-column">
      <IconLink icon={faCashRegister} size="3.3em" style="opacity: 0.2;" />
      {#if !$isMobile}
        <Button on:click={handleClick} depressed>
          Utiliser un smartphone comme scanner
        </Button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .flex-column {
    display: flex;
    flex-direction: column;
    gap: 2em;
  }

  img {
    border-radius: 10px;
    border: 2px solid grey;
    margin-bottom: 2em;
  }
</style>
