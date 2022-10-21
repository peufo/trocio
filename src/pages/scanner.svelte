<script lang="ts">
  import { onMount, tick, onDestroy } from 'svelte'
  import { params } from '@roxi/routify'
  import { Peer, DataConnection } from 'peerjs'

  import Scanner from '$lib/scanner/Scanner.svelte'
  import { connectionPrefix } from '$lib/scanner/store'
  import notify from '$lib/notify'
  import { Icon } from '$material'
  import {
    mdiCheck,
    mdiLanConnect,
    mdiLanDisconnect,
    mdiLanPending,
  } from '@mdi/js'

  let remote: DataConnection | undefined = undefined
  let isConnected = false
  const peer = new Peer()
  peer.on('open', () => {
    const token = $params['token']
    if (token) connectTo(token)
  })

  let pending = true
  onMount(() => {
    setTimeout(() => (pending = false), 1000)
    return () => remote?.removeAllListeners()
  })

  function connectTo(remoteToken: string) {
    if (isConnected) return
    remote = peer.connect(remoteToken)
    remote.on('open', () => (isConnected = true))
    remote.on('close', () => (isConnected = false))
    remote.on('error', (error) => notify.error(error.message))
  }

  function handleDetect(event: { detail: string }) {
    const detectedValue = event.detail
    console.log({ detectedValue })

    // Si la connection est établi, envoyer la détection
    if (isConnected && remote) {
      remote.send(detectedValue)
      return
    }

    // Si le code est l'address du scanner, on tente une connection
    if (detectedValue.startsWith(location.pathname)) {
      console.log('Connect try', { detectedValue })
      // TODO: récuperer et passer le token

      connectTo(detectedValue)
      return
    }

    notify.warning(`Ce code QR ne permet pas de se connecter à une caisse`)
    return
  }
</script>

<div class="wrapper">
  <Scanner isClosable={false} on:detect={handleDetect} />

  <div class="text-center mt-12">
    {#if pending && !isConnected}
      <div>
        <Icon path={mdiLanPending} class="blue-text mb-4" size="60" />
        <br />
        Connection à une caisse...
      </div>
    {:else if isConnected}
      <div>
        <Icon path={mdiLanConnect} class="green-text mb-4" size="60" />
        <br />
        Connecté à une caisse
      </div>
    {:else}
      <div>
        <Icon path={mdiLanDisconnect} class="orange-text mb-4" size="60" />
        <br />
        Non connecté à une caisse
      </div>
    {/if}
  </div>
</div>

<style>
  .wrapper {
    max-width: 600px;
    margin: auto;
  }
</style>
