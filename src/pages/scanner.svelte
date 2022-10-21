<script lang="ts">
  import { onMount } from 'svelte'
  import { params } from '@roxi/routify'
  import { Peer, DataConnection } from 'peerjs'

  import Scanner from '$lib/scanner/Scanner.svelte'
  import { connectionPrefix } from '$lib/scanner/store'
  import notify from '$lib/notify'

  let remote: DataConnection | undefined = undefined
  let isConnected = false

  onMount(() => {
    const token = $params['token']
    if (!token) return
    connectTo(token)
    return () => {
      remote?.removeAllListeners()
    }
  })

  function connectTo(remoteToken: string) {
    if (isConnected) return
    const peer = new Peer(remoteToken, { host: document.location.host })
    remote = peer.connect(remoteToken)
    remote.on('open', () => (isConnected = true))
    remote.on('close', () => (isConnected = false))
    remote.on('error', (error) => notify.error(error.message))
  }

  function handleDetect(event: { detail: string }) {
    const detectedValue = event.detail
    if (!isConnected || !remote) {
      if (detectedValue.startsWith($connectionPrefix)) {
        connectTo(detectedValue)
        return
      }
      notify.warning(`Il ne s'agit pas d'un code QR de connection`)
      return
    }
    remote.send(detectedValue)
  }
</script>

<div class="wrapper">
  <p>isConnected: {isConnected}</p>
  <Scanner isClosable={false} on:detect={handleDetect} />
</div>

<style>
  .wrapper {
    max-width: 600px;
    margin: auto;
  }
</style>
