<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import QrScanner from 'qr-scanner'
  import {
    mdiClose,
    mdiFlashlight,
    mdiFlashlightOff,
    mdiRepeat,
    mdiRepeatOff,
    mdiVibrate,
    mdiVibrateOff,
    mdiVolumeHigh,
    mdiVolumeOff,
  } from '@mdi/js'

  import { Button, Chip, Icon } from '$material'
  import { isMobile } from '$lib/store/layout'
  import notify from '$lib/notify'
  import soundPristine from '$assets/sounds/Pristine.wav'

  import {
    isAutoScanOn,
    isFlashOn,
    isSoundOn,
    isVibrateOn,
  } from '$lib/scanner/store'

  /** Params ajouter à la requet de l'article */
  export let isClosable = true

  const TIMEOUT = 9 // secondes
  let intervalId: NodeJS.Timeout
  let time = TIMEOUT

  let qrScanner: QrScanner
  let isScanning = false
  let isProcessing = false

  let video: HTMLVideoElement
  let audio: HTMLAudioElement
  let offsetWidth: number
  let overlay: HTMLDivElement
  let overlaySize: number

  const dispatch = createEventDispatcher<{ close: void; detect: string }>()

  onMount(async () => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      notify.warning('No camera detected')
      return
    }

    qrScanner = new QrScanner(video, onDetect, {
      maxScansPerSecond: 8,
      highlightScanRegion: true,
      overlay,
    })
    console.log('onMount')
    scan()

    const handleFlashOn = (v: boolean) => {
      if (v) qrScanner.turnFlashOn()
      else qrScanner.turnFlashOff()
    }
    isFlashOn.subscribe(handleFlashOn)
    handleFlashOn($isFlashOn)
  })

  onDestroy(() => {
    qrScanner?.destroy()
    clearInterval(intervalId)
  })

  function scan() {
    console.log('onScan')
    isScanning = true
    video.play()
    qrScanner.start()
    clearInterval(intervalId)
    time = TIMEOUT
    intervalId = setInterval(() => {
      if (--time <= 0) pause()
    }, 1000)
  }

  window.onfocus = scan

  function pause() {
    isScanning = false
    video?.pause()
    clearInterval(intervalId)
  }

  async function onDetect(scanResult: { data: string }) {
    isProcessing = true
    pause()
    if ($isSoundOn) audio.play()
    if ($isVibrateOn) navigator.vibrate([50])

    dispatch('detect', scanResult.data)

    const wait = 1400
    setTimeout(() => {
      isProcessing = false
      if ($isAutoScanOn) scan()
    }, wait)
  }
</script>

<div
  class="scanner-wrapper white-text"
  bind:offsetWidth
  style="height: {offsetWidth}px"
  on:click={scan}
>
  <video bind:this={video} kind="caption" width={offsetWidth}>
    <track kind="captions" />
  </video>
  <div
    class="overlay"
    bind:this={overlay}
    bind:offsetWidth={overlaySize}
    class:isScanning
    class:isProcessing
  >
    {#if overlaySize !== offsetWidth}
      {#if isScanning || isProcessing}
        <svg
          viewBox="0 0 {overlaySize} {overlaySize}"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width={overlaySize} height={overlaySize} rx="10" />
        </svg>
      {:else}
        <div style="text-align: center;">
          <h6>En pause</h6>
          <p>Toucher pour relancer</p>
        </div>
      {/if}
    {/if}
  </div>

  <div class="top-bar">
    {#if $isMobile}
      <Button icon outlined on:click={() => isFlashOn.update((v) => !v)}>
        <Icon path={$isFlashOn ? mdiFlashlight : mdiFlashlightOff} />
      </Button>
    {/if}

    <Button icon outlined on:click={() => isSoundOn.update((v) => !v)}>
      <Icon path={$isSoundOn ? mdiVolumeHigh : mdiVolumeOff} />
    </Button>

    {#if $isMobile}
      <Button icon outlined on:click={() => isVibrateOn.update((v) => !v)}>
        <Icon path={$isVibrateOn ? mdiVibrate : mdiVibrateOff} />
      </Button>
    {/if}

    <Button icon outlined on:click={() => isAutoScanOn.update((v) => !v)}>
      <Icon path={$isAutoScanOn ? mdiRepeat : mdiRepeatOff} />
    </Button>

    <div class="flex-grow-1" />
    {#if isClosable}
      <Button icon outlined on:click={() => dispatch('close')}>
        <Icon path={mdiClose} />
      </Button>
    {/if}
  </div>

  <div class="bottom-bar">
    <div class="flex-grow-1" />

    {#if isProcessing}
      <Chip label>
        <span>Traitement du code QR ...</span>
      </Chip>
    {:else if isScanning}
      <Chip label>
        <span>Recherche d'un code QR ... ( {time} )</span>
      </Chip>
    {/if}

    <div class="flex-grow-1" />
  </div>
</div>

<audio src={soundPristine} bind:this={audio} />

<style lang="scss">
  $overlay-radius: 10px;
  $diff-radius: 2.14601836px; // 10 * ((4 - PI) / 4)

  .scanner-wrapper {
    position: relative;
    display: grid;
    align-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 6px;
  }
  .top-bar,
  .bottom-bar {
    position: absolute;
    left: 0px;
    right: 0px;
    display: flex;
    padding: 8px;
    gap: 8px;
  }

  .top-bar {
    top: 0px;
  }
  .bottom-bar {
    bottom: 0px;
  }

  .overlay {
    inset: 0px;
    display: grid;
    place-items: center;
    outline: rgba(0, 0, 0, 0.2) 9999px solid;
    border-radius: $overlay-radius;
    outline-offset: 4px;

    & > svg {
      overflow: visible;
    }

    & > svg > rect {
      fill: transparent;
      stroke-linecap: round;
      animation-name: rotate-stroke;
      animation-duration: 2000ms;
      animation-iteration-count: infinite;
      stroke: #fff;
      stroke-width: 4px;
      stroke-opacity: 0.6;
      stroke-dasharray: calc(50% - $diff-radius);
    }

    &:not(.isProcessing):not(.isScanning) {
      background: rgba(0, 0, 0, 0.6);
      outline-offset: 0px;
    }

    &.isProcessing > svg > rect {
      animation-timing-function: linear;
      animation-duration: 800ms;
      stroke: #4456a8;
      stroke-width: 8px;
      stroke-opacity: 1;
    }
  }

  @keyframes rotate-stroke {
    from {
      stroke-dashoffset: calc(25% + calc(4 * $diff-radius));
    }
    to {
      stroke-dashoffset: calc(125% + calc(2 * $diff-radius));
    }
  }
</style>
