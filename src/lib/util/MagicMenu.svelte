<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import { debounce } from 'debounce'

  import { Dialog } from '$material'

  import { isMobile } from '$lib/store/layout'

  export let active = false

  const dispatch = createEventDispatcher<{ open: void; close: void }>()

  let position = { x: 0, y: 0 }
  let mouseHover = false

  let menuHeight = 0

  export function open(event: MouseEvent) {
    position = { x: event.pageX - 92, y: event.pageY - 20 }
    active = true
    dispatch('open')
  }

  export function close() {
    active = false
    dispatch('close')
  }

  const handleMouseLeave = debounce(() => mouseHover || close(), 400)

  $: {
    const { offsetHeight } = document.body
    if (position.y + menuHeight > offsetHeight) {
      position.y = offsetHeight - menuHeight - 10
    }
  }
</script>

{#if $isMobile}
  <Dialog bind:active>
    <slot />
  </Dialog>
{:else if active}
  <div
    class="s-menu"
    bind:offsetHeight={menuHeight}
    in:fade|local={{ duration: 150 }}
    out:fade|local={{ duration: 150 }}
    on:mouseenter={() => (mouseHover = true)}
    on:mouseleave={() => {
      mouseHover = false
      handleMouseLeave()
    }}
    style="left: {position.x}px; top: {position.y}px;"
  >
    <slot />
  </div>
{/if}

<style>
  .s-menu {
    overflow: hidden;
    max-height: 400px;
    z-index: 50;
  }
</style>
