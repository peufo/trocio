<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import { debounce } from 'debounce'

  import { Dialog } from '$material'

  import { isMobile } from '$lib/store/layout'

  import PaymentDialog from '$lib/cash/PaymentDialog.svelte'

  export let active = false

  const dispatch = createEventDispatcher<{ open: void; close: void }>()

  let position = { x: 0, y: 0 }
  let mouseHover = false
  let paymentDialog: PaymentDialog
  const MENU_HEIGHT = 320 // En dur désolé...

  export function open(event: MouseEvent) {
    position = { x: event.pageX - 92, y: event.pageY - 20 }
    const { offsetHeight } = document.body
    if (position.y + MENU_HEIGHT > offsetHeight) {
      position.y = offsetHeight - MENU_HEIGHT
    }
    active = true
    dispatch('open')
  }

  export function close() {
    active = false
    dispatch('close')
  }

  const handleMouseLeave = debounce(() => mouseHover || close(), 400)
</script>

<PaymentDialog bind:this={paymentDialog} modeCorrection />

{#if $isMobile}
  <Dialog bind:active>
    <slot />
  </Dialog>
{:else if active}
  <div
    class="s-menu"
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
