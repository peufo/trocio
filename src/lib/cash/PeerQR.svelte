<script lang="ts">
  import QrCode from 'qrcode'
  import { faCashRegister } from '@fortawesome/free-solid-svg-icons'
  import { mdiCellphoneWireless, mdiQrcodeScan } from '@mdi/js'
  import { fade } from 'svelte/transition'

  import { isMobile } from '$lib/store/layout'
  import IconLink from '$lib/util/IconLink.svelte'
  import { Icon } from '$material'

  export let peerToken: string
  export let peerConnections: number
  export let disabled: boolean

  let qrcode = ''

  $: {
    const scannerURL = `https://${location.host}/scanner?token=${peerToken}`
    QrCode.toDataURL(scannerURL).then((qr) => (qrcode = qr))
  }
</script>

{#if disabled}
  <IconLink icon={faCashRegister} size="160" style="opacity: 0.3;" />
{:else}
  <div
    class="d-flex flex-column justify-center"
    style="gap: 0.5 em; text-align: center;"
  >
    {#if $isMobile}
      <IconLink icon={faCashRegister} size="160" style="opacity: 0.3;" />
      <br />
      <IconLink icon={mdiQrcodeScan} href="/scanner" fab />
      <p class="text-caption">Se connecter à une caisse ?</p>
    {:else}
      <div class="d-flex justify-center" style="gap: 2em;">
        <IconLink icon={faCashRegister} size="60" style="opacity: 0.3;" />
        {#each Array(peerConnections) as p, i}
          <div transition:fade|local>
            <Icon
              path={mdiCellphoneWireless}
              class="secondary-text"
              size="60"
            />
          </div>
        {/each}
      </div>
      <br />

      <img src={qrcode} alt="Code QR de connexion mobile" />

      {#if !!peerConnections}
        <p in:fade|local class="text-caption">
          Connexion établie ({peerConnections})
        </p>
      {:else}
        <p in:fade|local class="text-caption">Connectez votre smartphone</p>
      {/if}
    {/if}
  </div>
{/if}

<style>
  img {
    border-radius: 10px;
    border: 2px solid grey;
    margin-bottom: 1em;
    width: fit-content;
    margin: auto;
  }

  .text-caption {
    opacity: 0.8;
  }
</style>
