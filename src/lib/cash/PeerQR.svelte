<script lang="ts">
  import QrCode from 'qrcode'
  import { faCashRegister } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  import { Icon } from '$material'
  import { mdiCellphoneLink } from '@mdi/js'
  import { fade, slide } from 'svelte/transition'

  export let peerToken: string
  export let peerConnections: number
  export let disabled: boolean

  let qrcode = ''

  $: {
    const scannerURL = `https://${location.host}/scanner?token=${peerToken}`
    QrCode.toDataURL(scannerURL).then((qr) => (qrcode = qr))
  }
</script>

<div class="d-flex flex-column" style="gap: 1em;">
  <IconLink icon={faCashRegister} size="3.3em" style="opacity: 0.3;" />

  {#if !disabled}
    <div style="text-align: center;">
      <img src={qrcode} alt="Code QR de connexion mobile" />
      <br />

      {#if !!peerConnections}
        <div in:slide|local>
          <Icon path={mdiCellphoneLink} class="green-text" size="60" />
        </div>
      {/if}

      {#if !!peerConnections}
        <p in:fade|local class="text-caption">
          Connexion établie ({peerConnections})
        </p>
      {:else}
        <p in:fade|local class="text-caption">
          Connectez votre smartphone à cette caisse
        </p>
      {/if}
    </div>
  {/if}
</div>

<style>
  img {
    border-radius: 10px;
    border: 2px solid grey;
    margin-bottom: 1em;
  }

  .text-caption {
    opacity: 0.8;
  }
</style>
