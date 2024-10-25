<script lang="ts">
  import { onMount } from 'svelte'

  let events: string[] = []

  onMount(() => {
    const subscription = new EventSource('/api/cash-sse/subscribe')

    const handleEvent = ({ data }: MessageEvent<string>) => {
      console.log({ data })
      events = [...events, data]
    }

    subscription.addEventListener('prout', handleEvent)

    return () => {
      subscription.removeEventListener('prout', handleEvent)
      subscription.close()
    }
  })
</script>

<div>
  <h2>Emit</h2>
  <form
    method="post"
    on:submit|preventDefault={() =>
      fetch('/api/cash-sse/emit/prout', {
        method: 'post',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({ date: new Date().toJSON() }),
      })}
  >
    <button>Emit</button>
  </form>
</div>

<div>
  <h2>Listen</h2>
  <ul>
    {#each events as data}
      <li>{data}</li>
    {/each}
  </ul>
</div>
