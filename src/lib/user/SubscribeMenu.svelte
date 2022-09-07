<script lang="ts">
  import { fade } from 'svelte/transition'
  import { debounce } from 'debounce'

  import type { SubscribeLookup } from 'types'
  import { isMobile } from '$lib/store/layout'
  import SubscribeMenuList from './SubscribeMenuList.svelte'

  export let active = false
  export let state: 'main' | 'role' | 'tarif' = 'main'
  export let subscribe: SubscribeLookup | undefined = undefined

  let position = { x: 0, y: 0 }
  let mouseIn = false

  export function open(event: MouseEvent, sub: SubscribeLookup) {
    position = { x: event.pageX - 92, y: event.pageY - 20 }
    state = 'main'
    subscribe = sub
    active = true
  }

  export function close() {
    active = false
  }

  const handleMouseLeave = debounce(() => mouseIn || close(), 400)
</script>

{#if $isMobile}
  <div>isMobile</div>
{:else if active}
  <div
    class="s-menu"
    in:fade|local={{ duration: 150 }}
    out:fade|local={{ duration: 150 }}
    on:mouseenter={() => (mouseIn = true)}
    on:mouseleave={() => {
      mouseIn = false
      handleMouseLeave()
    }}
    style="left: {position.x}px; top: {position.y}px;"
  >
    <SubscribeMenuList on:done={close} {state} {subscribe} />
  </div>
{/if}

<style>
  .s-menu {
    overflow: hidden;
    max-height: 400px;
    z-index: 50;
  }
</style>
