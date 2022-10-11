<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import QrScanner from 'qr-scanner'
  import {
    mdiClose,
    mdiFlashlight,
    mdiFlashlightOff,
    mdiLoading,
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

  const TIMEOUT = 5000

  let result = ''
  let isRuning = false
  let isProcessing = false
  let isAutoScan = true
  let isVibrateOn = true
  let isFlashOnDetect = false
  let isSoundOn = false
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

    qrScanner = new QrScanner(video, onSuccess, {
      maxScansPerSecond: 5,
      highlightScanRegion: true,
    })
    scan()
  })

  onDestroy(() => {
    qrScanner?.destroy()
  })

  function scan() {
    isRuning = true
    video.play()
    qrScanner.start()
    isFlashOnDetect = qrScanner.isFlashOn()
    scannTimeOut = setTimeout(pause, TIMEOUT)
  }

  function pause() {
    isRuning = false
    video.pause()
    // qrScanner.pause()
    clearTimeout(scannTimeOut)
  }

  async function onSuccess(scanResult: string) {
    isProcessing = true
    pause()
    result = scanResult
    if (isSoundOn) audio.play()
    if (isVibrateOn) navigator.vibrate([50])

    // Simulation d'appel à l'api
    setTimeout(() => {
      isProcessing = false
      if (isAutoScan) scan()
    }, 5000)
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
  <div class="overlay">
    <div />
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
    {:else if isRuning}
      <Chip label>
        <span>Scan en cours ...</span>
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
    position: absolute;
    inset: 0px;
    border: red solid 2px;
    display: grid;
    place-items: center;
  }
  .overlay > div {
    width: 40px;
    height: 40px;
    border: green solid 2px;
  }
</style>
