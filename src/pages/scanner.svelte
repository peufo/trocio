<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import QrScanner from 'qr-scanner'

  import sound1 from '$assets/sounds/Pristine.wav'
  import sound2 from '$assets/sounds/Badam.wav'
  import sound3 from '$assets/sounds/Rose_Wood.wav'
  import sound4 from '$assets/sounds/Oxygen.wav'

  let result = ''

  let video: HTMLVideoElement
  let audio: HTMLAudioElement
  let qrScanner: QrScanner
  let offsetWidth: number

  const sounds = {
    Pristine: sound1,
    Badam: sound2,
    Rose_Wood: sound3,
    Oxygen: sound4,
  }

  onMount(async () => {
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      video.srcObject = stream
    }
    qrScanner = new QrScanner(video, handleResult)
    qrScanner.start()
  })

  function handleResult(scanResult: string) {
    result = scanResult
    audio.play()
    qrScanner.stop()
    setTimeout(() => {
      qrScanner.start()
    }, 2000)
  }

  onDestroy(() => {
    qrScanner.destroy()
  })
</script>

<div class="container" bind:offsetWidth>
  <video autoplay bind:this={video} kind="caption" width={offsetWidth - 20}>
    <track kind="captions" />
  </video>
  <audio src={sounds.Badam} bind:this={audio} />
</div>

{#if result}
  <h1><a href={result}>{result}</a></h1>
{:else}
  <h1>Scan en cours...</h1>
{/if}

<style>
  video {
    border-radius: 10px;
    filter: grayscale(80%);
  }
  .container {
    width: 100vw;
    padding: 10px;
    overflow: hidden;
  }
</style>
