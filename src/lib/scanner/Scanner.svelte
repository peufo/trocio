<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import QrScanner from 'qr-scanner'

  import sound1 from '$assets/sounds/Pristine.wav'
  import sound2 from '$assets/sounds/Badam.wav'
  import sound3 from '$assets/sounds/Rose_Wood.wav'
  import sound4 from '$assets/sounds/Oxygen.wav'
  import notify from '$lib/notify'
  import { Button, Icon } from '$material'
  import {
    mdiClose,
    mdiFlash,
    mdiFlashlight,
    mdiFlashlightOff,
    mdiFlashOff,
    mdiFlashOutline,
  } from '@mdi/js'

  const TIMEOUT = 5000

  let result = ''
  let isAutoScan = false
  let isFlashOn = false
  let scannTimeOut: NodeJS.Timeout
  let video: HTMLVideoElement
  let audio: HTMLAudioElement
  let qrScanner: QrScanner
  let offsetWidth: number
  let offsetHeight: number

  const sounds = {
    Pristine: sound1,
    Badam: sound2,
    Rose_Wood: sound3,
    Oxygen: sound4,
  }

  const dispatch = createEventDispatcher<{ close: void }>()

  onMount(async () => {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      // TODO: HANDLE NO CAMERA
      notify.warning('No camera detected')
      return
    }
    video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
    })

    qrScanner = new QrScanner(video, onDecode, {
      highlightCodeOutline: true,
      highlightScanRegion: true,
      maxScansPerSecond: 5,
    })
    scan()
    // qrScanner.start()
  })

  onDestroy(() => {
    qrScanner?.destroy()
  })

  function scan() {
    video.play()
    qrScanner.start()
    isFlashOn = qrScanner.isFlashOn()
    scannTimeOut = setTimeout(pause, TIMEOUT)
  }

  function pause() {
    // video.pause()
    qrScanner.pause()
    clearTimeout(scannTimeOut)
  }

  function onDecode(scanResult: string) {
    pause()
    result = scanResult
    // audio.play()
    navigator.vibrate([200])
    qrScanner.stop()
    // Simulation d'appel à l'api
    setTimeout(() => {
      if (isAutoScan) scan()
    }, 2000)
  }

  function toggleFlashLight() {
    qrScanner.toggleFlash()
    isFlashOn = qrScanner.isFlashOn()
  }
</script>

<div class="scanner-wrapper" bind:offsetWidth>
  <video
    bind:this={video}
    kind="caption"
    width={offsetWidth}
    height={offsetHeight}
  >
    <track kind="captions" />
  </video>

  <div class="top-bar">
    <div class="flex-grow-1" />
    <Button icon outlined on:click={toggleFlashLight}>
      <Icon path={isFlashOn ? mdiFlashlight : mdiFlashlightOff} />
    </Button>

    <Button icon outlined on:click={() => dispatch('close')}>
      <Icon path={mdiClose} />
    </Button>
  </div>
</div>

<audio src={sounds.Badam} bind:this={audio} />

{#if result}
  <h1><a href={result}>{result}</a></h1>
{:else}
  <h1>Scan en cours...</h1>
{/if}

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
  .top-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    padding: 8px;
    gap: 8px;
  }
</style>
