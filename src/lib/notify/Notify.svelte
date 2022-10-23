<script lang="ts">
  import { onMount } from 'svelte'
  import { scale } from 'svelte/transition'
  import type { ScaleParams } from 'svelte/transition'
  import { Button, Icon } from '$material'
  import { mdiClose } from '@mdi/js'

  type TNotify = 'info' | 'success' | 'warning' | 'error'

  export let type: TNotify = 'info'
  export let text = ''
  export let title = ''
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
    transition:scale|local={transitionParams}
    on:outroend
    on:introend={introend}
    class="notify elevation-12 notify-{type}"
  >
    <div class="text">
      {#if title}
        <b>{title} - </b>
      {/if}
      <span>{text}</span>
    </div>
    {#if persistent}
      <div class="pr-1">
        <Button icon on:click={() => (isActive = false)}>
          <Icon path={mdiClose} />
        </Button>
      </div>
    {/if}
  </div>
{/if}

<style>
  .notify {
    position: fixed;
    bottom: 1em;
    left: 50%;
    transform: translateX(-50%);
    max-width: calc(100% - 0.5rem);
    display: flex;
    align-items: center;
    border-radius: 6px;
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

  .notify-success {
    outline: solid 2px #a7ff9d;
  }

  .notify-warning {
    outline: solid 2px #ffc49d;
  }
  .notify-error {
    outline: solid 2px #f10;
  }
</style>
