<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import QrScanner from 'qr-scanner'

  import beepUrl from '$assets/beep.mp3'

  let result = ''

  let video: HTMLVideoElement
  let audio: HTMLAudioElement
  let qrScanner: QrScanner

  onMount(async () => {
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      video.srcObject = stream
    }
    qrScanner = new QrScanner(video, handleResult)
    qrScanner.start()
    //console.log(qrScanner.hasCamera())
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

<div class="container">
  <video autoplay bind:this={video} kind="caption" height="350">
    <track kind="captions" />
  </video>
  <audio src={beepUrl} bind:this={audio} />
</div>

{#if result}
  <h1><a href={result}>{result}</a></h1>
{:else}
  <h1>Scan en cours...</h1>
{/if}

<style>
  .container {
    width: 100vw;
  }
</style>
