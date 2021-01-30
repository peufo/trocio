<script>

    import { onMount, onDestroy } from 'svelte'
    import QrScanner from 'qr-scanner'

    let result = ''

    let video
    let qrScanner

    onMount(() => {
        if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
            navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
                video.srcObject = stream
            })
        }
        qrScanner = new QrScanner(video, res => result = res)
        qrScanner.start()
        //console.log(qrScanner.hasCamera())
    })

    onDestroy(() => {
        qrScanner.destroy()
    })

</script>

<video autoplay bind:this={video}></video>

{#if result}
    <h1><a href={result}>{result}</a></h1>
{:else}
    <h1>Scan en cours...</h1>
{/if}
