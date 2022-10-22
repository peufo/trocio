<script lang="ts">
  import { onMount } from 'svelte'
  import { params, redirect, url } from '@roxi/routify'
  import { Peer, DataConnection } from 'peerjs'

  import Scanner from '$lib/scanner/Scanner.svelte'
  import notify from '$lib/notify'
  import { Icon } from '$material'
  import { mdiLanConnect, mdiLanDisconnect, mdiLanPending } from '@mdi/js'

  let remote: DataConnection | undefined = undefined
  let isConnected = false
  const peer = new Peer()
  peer.on('open', () => {
    const token = $params['token']
    if (token) connectTo(token)
  })

  let pending = !!$params['token']

  onMount(() => {
    if (pending) setTimeout(() => (pending = false), 2000)
    return () => peer.destroy()
  })

  async function connectTo(remoteToken: string) {
    if (isConnected) return
    remote = peer.connect(remoteToken)
    remote.on('open', () => (isConnected = true))
    remote.on('close', () => (isConnected = false))
    remote.on('iceStateChanged', (state) => {
      if (state === 'disconnected') isConnected = false
    })
    remote.on('error', (error) => {
      isConnected = false
      notify.error(error.message)
    })

    if ($params['token'] !== remoteToken) {
      $redirect($url(undefined, { token: remoteToken }))
    }
  }

  function handleDetect(event: { detail: string }) {
    const detectedValue = event.detail

    // Si la connexion est établi, envoyer la détection
    if (isConnected && remote) {
      remote.send(detectedValue)
      return
    }

    // Si le code est l'adresse du scanner, on tente une connexion
    const baseUrl = location.origin + location.pathname
    if (detectedValue.startsWith(baseUrl)) {
      const paramsString = detectedValue.replace(baseUrl, '')
      const searchParams = new URLSearchParams(paramsString)
      const token = searchParams.get('token')
      if (token) {
        connectTo(token)
        return
      }
    }

    handleDetectError()
  }

  function handleDetectError() {
    notify.warning(`Ce code QR ne permet pas de se connecter à une caisse`)
  }
</script>

<div class="wrapper">
  <Scanner isClosable={false} on:detect={handleDetect} />

  <div class="text-center mt-12">
    {#if pending && !isConnected}
      <div>
        <Icon path={mdiLanPending} class="blue-text mb-4" size="60" />
        <br />
        Connexion à une caisse...
      </div>
    {:else if isConnected}
      <div>
        <Icon path={mdiLanConnect} class="green-text mb-4" size="60" />
        <br />
        Connexion établie
        <br />
        Vous pouvez scanner des étiquettes
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
