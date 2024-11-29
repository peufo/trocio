<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Overlay from '../Overlay'
  import Style from '../../internal/Style'
  import { scale } from 'svelte/transition'

  let klass = ''
  export { klass as class }
  export let active = false
  export let persistent = false
  export let disabled = false
  export let width = 500
  export let fullscreen = false
  export let transition = scale
  export let overlay = {}
  export let styleBox = ''
  export let style = ''

  const dispatch = createEventDispatcher<{ close: void }>()

  function close() {
    if (!persistent) {
      active = false
      dispatch('close')
    }
  }
  $: visible = active && !disabled
</script>

{#if visible}
  <div
    role="document"
    class="s-dialog"
    style={styleBox}
    use:Style={{ 'dialog-width': width }}
  >
    <div
      {style}
      class="s-dialog__content {klass}"
      class:fullscreen
      transition:transition={{ duration: 300, start: 0.1 }}
      on:introstart
      on:outrostart
      on:introend
      on:outroend
    >
      <slot />
    </div>
  </div>
{/if}
<Overlay {...overlay} active={visible} on:click={close} />

<style lang="scss" src="./Dialog.scss" global>
</style>
