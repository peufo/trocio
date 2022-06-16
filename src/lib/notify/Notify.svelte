<script lang="ts">
  import { onMount } from 'svelte'
  import { scale } from 'svelte/transition'
  import type { ScaleParams } from 'svelte/transition'
  import { Button, Icon } from 'svelte-materialify'
  import { mdiClose } from '@mdi/js'

  export let text = 'prout'
  export let duration = 3000
  export let transitionParams: ScaleParams = { duration: 300 }
  export let persistent = false

  let isActive = false
  let timeoutId: NodeJS.Timeout

  onMount(() => {
    isActive = true
    return () => timeoutId && clearTimeout(timeoutId)
  })

  function introend() {
    if (persistent) return
    timeoutId = setTimeout(() => (isActive = false), duration)
  }
</script>

{#if isActive}
  <div
    class="wrapper"
    transition:scale|local={transitionParams}
    on:outroend
    on:introend={introend}
  >
    <div class="container">
      <div class="text">{text}</div>
      {#if persistent}
        <div class="pr-1">
          <Button icon on:click={() => (isActive = false)}>
            <Icon path={mdiClose} />
          </Button>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .wrapper {
    position: fixed;
    bottom: 0;
    width: calc(100% - 1rem);
    margin: 0.5rem;
    display: grid;
    justify-content: center;
  }

  .container {
    display: flex;
    align-items: center;
    border-radius: 4px;
    color: white;
    background-color: #333233;
  }

  .text {
    padding: 10px 15px;
    max-height: 5.5em;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }
</style>
