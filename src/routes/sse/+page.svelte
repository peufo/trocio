<script lang="ts">
  import { onMount } from 'svelte'
  import { subscribe, emit } from '$lib/sse'

  let events: string[] = []

  onMount(() => {
    const unsubscribe = subscribe({
      test(data) {
        console.log({ data })
        events = [...events, data.date]
      },
    })
    return unsubscribe
  })
</script>

<div>
  <h2>Emit</h2>
  <form
    method="post"
    on:submit|preventDefault={() => emit('test', { date: new Date().toJSON() })}
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
