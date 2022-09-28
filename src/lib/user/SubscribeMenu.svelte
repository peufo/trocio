<script lang="ts">
  import { fade } from 'svelte/transition'
  import { debounce } from 'debounce'
  import { Dialog } from '$material'

  import type { SubscribeLookup } from 'types'
  import { isMobile } from '$lib/store/layout'
  import SubscribeMenuList from './SubscribeMenuList.svelte'
  import PaymentDialog from '$lib/cash/PaymentDialog.svelte'

  export let active = false
  export let state: 'main' | 'role' | 'tarif' = 'main'
  export let subscribe: SubscribeLookup | undefined = undefined

  let position = { x: 0, y: 0 }
  let mouseIn = false
  let paymentDialog: PaymentDialog

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

  function handleSoldCorrection() {
    active = false
    paymentDialog.open(subscribe, 'Correction du solde')
  }

  function handleSelectRoleOrTarif() {
    setTimeout(() => (active = false), 200)
  }
</script>

<PaymentDialog bind:this={paymentDialog} />

{#if $isMobile}
  <Dialog bind:active>
    <SubscribeMenuList
      {state}
      {subscribe}
      on:soldCorrection={handleSoldCorrection}
      on:roleSelect={handleSelectRoleOrTarif}
      on:tarifSelect={handleSelectRoleOrTarif}
    />
  </Dialog>
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
    <SubscribeMenuList
      {state}
      {subscribe}
      on:soldCorrection={handleSoldCorrection}
    />
  </div>
{/if}

<style>
  .s-menu {
    overflow: hidden;
    max-height: 400px;
    z-index: 50;
  }
</style>
