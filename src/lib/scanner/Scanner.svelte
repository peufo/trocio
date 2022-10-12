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
  import notify from '$lib/notify'
  import soundPristine from '$assets/sounds/Pristine.wav'
  import type { Article } from 'types'
  import { api } from '$lib/api'

  /** Params ajouter à la requet de l'article */
  export let queryParams = {}

  const TIMEOUT = 9 // secondes
  let timeoutId: NodeJS.Timeout
  let time = TIMEOUT

  let qrScanner: QrScanner
  let isScanning = false
  let isProcessing = false
  let isAutoScan = true
  let isVibrateOn = true
  let isFlashOnDetect = false
  let isSoundOn = false
  let video: HTMLVideoElement
  let audio: HTMLAudioElement
  let offsetWidth: number
  let offsetHeight: number
  let overlay: HTMLDivElement
  let overlaySize: number

  const dispatch = createEventDispatcher<{ close: void; select: Article }>()

  onMount(async () => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      notify.warning('No camera detected')
      return
    }

    // @ts-ignore
    qrScanner = new QrScanner(video, onDetect, {
      maxScansPerSecond: 8,
      highlightScanRegion: true,
      overlay,
    })
    scan()
  })

  onDestroy(() => {
    qrScanner?.destroy()
    clearInterval(timeoutId)
  })

  function scan() {
    isScanning = true
    video.play()
    qrScanner.start()
    isFlashOnDetect = qrScanner.isFlashOn()
    clearInterval(timeoutId)
    time = TIMEOUT
    timeoutId = setInterval(() => --time <= 0 && pause(), 1000)
  }

  function pause() {
    isScanning = false
    video.pause()
    clearInterval(timeoutId)
  }

  async function onDetect(scanResult: { data: string }) {
    isProcessing = true
    pause()
    if (isSoundOn) audio.play()
    if (isVibrateOn) navigator.vibrate([50])

    // Garantie une pause un temps de traitement minimum pour évité les doubles scan
    const minimalPause = 1000
    const startTime = new Date().getTime()

    // Récupère l'article scanner
    const [article] = await api<Article[]>('/api/articles', {
      params: { exact__id: scanResult.data, ...queryParams },
    })

    if (article) dispatch('select', article)
    else notify.error('Article introuvable') // TODO: Personalisé le message d'erreur

    const getNextState = () => {
      isProcessing = false
      if (isAutoScan) scan()
    }
    const elapsedTime = new Date().getTime() - startTime
    setTimeout(getNextState, minimalPause - elapsedTime)
  }

  function toggleFlashLight() {
    qrScanner.toggleFlash()
    isFlashOnDetect = qrScanner.isFlashOn()
  }
</script>

<div class="scanner-wrapper" bind:offsetWidth on:click={scan}>
  <video
    bind:this={video}
    kind="caption"
    width={offsetWidth}
    height={offsetHeight}
  >
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
        <h6>En pause</h6>
        <p>Toucher pour relancer</p>
      {/if}
    {/if}
  </div>

  <div class="top-bar">
    <Button icon outlined on:click={toggleFlashLight}>
      <Icon path={isFlashOnDetect ? mdiFlashlight : mdiFlashlightOff} />
    </Button>
    <Button icon outlined on:click={() => (isSoundOn = !isSoundOn)}>
      <Icon path={isSoundOn ? mdiVolumeHigh : mdiVolumeOff} />
    </Button>
    <Button icon outlined on:click={() => (isVibrateOn = !isVibrateOn)}>
      <Icon path={isVibrateOn ? mdiVibrate : mdiVibrateOff} />
    </Button>
    <Button icon outlined on:click={() => (isAutoScan = !isAutoScan)}>
      <Icon path={isAutoScan ? mdiRepeat : mdiRepeatOff} />
    </Button>

    <div class="flex-grow-1" />

    <Button icon outlined on:click={() => dispatch('close')}>
      <Icon path={mdiClose} />
    </Button>
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

<style>
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
    border-radius: 10px;
    outline-offset: 4px;
  }

  .overlay > svg {
    overflow: visible;
  }

  .overlay > svg > rect {
    fill: transparent;
    stroke-linecap: round;
    animation-name: rotate-stroke;
    animation-duration: 2000ms;
    animation-iteration-count: infinite;
    stroke: #fff;
    stroke-width: 4;
    stroke-opacity: 0.6;
    stroke-dasharray: 49%;
    stroke-dashoffset: 27%;
  }
  .overlay:not(.isProcessing):not(.isScanning) {
    background: rgba(0, 0, 0, 0.6);
    outline-offset: 0px;
  }

  .overlay.isProcessing > svg > rect {
    animation-timing-function: linear;
    animation-duration: 800ms;
    stroke: #4456a8;
    stroke-width: 8;
    stroke-opacity: 1;
  }

  @keyframes rotate-stroke {
    from {
      stroke-dashoffset: 27%;
    }
    to {
      stroke-dashoffset: 125%;
    }
  }
</style>
