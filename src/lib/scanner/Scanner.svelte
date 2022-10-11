<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import QrScanner from 'qr-scanner'
  import {
    mdiClose,
    mdiFlashlight,
    mdiFlashlightOff,
    mdiVibrate,
    mdiVibrateOff,
    mdiVolumeHigh,
    mdiVolumeOff,
  } from '@mdi/js'

  import { Button, Icon } from '$material'
  import notify from '$lib/notify'
  import soundPristine from '$assets/sounds/Pristine.wav'

  const TIMEOUT = 15000

  let result = ''
  let isAutoScan = false
  let isFlashOnDetect = false
  let isVibrateOnDetect = true
  let isSoundOnDetect = false
  let scannTimeOut: NodeJS.Timeout
  let video: HTMLVideoElement
  let audio: HTMLAudioElement
  let qrScanner: QrScanner
  let offsetWidth: number
  let offsetHeight: number

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
  })

  onDestroy(() => {
    qrScanner?.destroy()
  })

  function scan() {
    video.play()
    qrScanner.start()
    isFlashOnDetect = qrScanner.isFlashOn()
    scannTimeOut = setTimeout(pause, TIMEOUT)
  }

  function pause() {
    video.pause()
    // qrScanner.pause()
    clearTimeout(scannTimeOut)
  }

  function onDecode(scanResult: string) {
    pause()
    result = scanResult
    qrScanner.stop()
    if (isSoundOnDetect) audio.play()
    if (isVibrateOnDetect) navigator.vibrate([50])

    // Simulation d'appel à l'api
    setTimeout(() => {
      if (isAutoScan) scan()
    }, 2000)
  }

  function toggleFlashLight() {
    qrScanner.toggleFlash()
    isFlashOnDetect = qrScanner.isFlashOn()
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
    <Button icon outlined on:click={toggleFlashLight}>
      <Icon path={isFlashOnDetect ? mdiFlashlight : mdiFlashlightOff} />
    </Button>
    <Button
      icon
      outlined
      on:click={() => (isVibrateOnDetect = !isVibrateOnDetect)}
    >
      <Icon path={isVibrateOnDetect ? mdiVibrate : mdiVibrateOff} />
    </Button>
    <Button icon outlined on:click={() => (isSoundOnDetect = !isSoundOnDetect)}>
      <Icon path={isSoundOnDetect ? mdiVolumeHigh : mdiVolumeOff} />
    </Button>

    <div class="flex-grow-1" />

    <Button icon outlined on:click={() => dispatch('close')}>
      <Icon path={mdiClose} />
    </Button>
  </div>
</div>

<audio src={soundPristine} bind:this={audio} />

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
