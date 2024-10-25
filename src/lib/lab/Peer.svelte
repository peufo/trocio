<script lang="ts">
  import { Peer, DataConnection } from 'peerjs'
  import { v4 } from 'uuid'

  export let name: string

  const token = v4()
  const peer = new Peer(token)
  let remote: DataConnection | undefined = undefined
  let remoteToken = ''
  let message = 'YOLO'
  let messages: unknown[] = []

  peer.on('connection', (local) => {
    console.log(`${name} has a new connection`)
    local.on('data', (data) => {
      messages = [...messages, data]
    })
  })

  function connect() {
    console.log('connect', remoteToken)
    remote = peer.connect(remoteToken)
    remote.on('iceStateChanged', (state) => {
      console.log('Connection state', state)
    })
    remote.on('open', () => {
      console.log(`${name} open a connection`)
    })
  }

  function sendMessage() {
    if (!remote) return
    remote.send(message)
  }

  function handleDestroy() {
    console.log(peer)
    peer.destroy()
    console.log(peer)
  }
</script>

<h6>{name}</h6>
<p>{token}</p>

<form on:submit|preventDefault={connect}>
  <input type="text" bind:value={remoteToken} placeholder="Remote token" />
  <button>Connect</button>
</form>

<br />

<form on:submit|preventDefault={sendMessage}>
  <input type="text" bind:value={message} placeholder="message" />
  <button>Send</button>
</form>

<br />

<button on:click={handleDestroy}>Destroy</button>

<ul>
  {#each messages as m}
    <li>
      {JSON.stringify(m)}
    </li>
  {/each}
</ul>

<style>
  input,
  button {
    border: 2px grey solid;
    padding: 4px 8px;
    border-radius: 4px;
  }
</style>
