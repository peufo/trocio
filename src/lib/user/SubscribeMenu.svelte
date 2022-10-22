<script lang="ts">
  import type { SubscribeLookup } from 'types'
  import MagicMenu from '$lib/util/MagicMenu.svelte'
  import { isMobile } from '$lib/store/layout'
  import SubscribeMenuList from './SubscribeMenuList.svelte'
  import PaymentDialog from '$lib/cash/PaymentDialog.svelte'

  export let state: 'main' | 'role' | 'tarif' = 'main'
  export let subscribe: SubscribeLookup | undefined = undefined

  let paymentDialog: PaymentDialog

  let magicMenu: MagicMenu

  export function open(event: MouseEvent, sub: SubscribeLookup) {
    state = 'main'
    subscribe = sub
    magicMenu.open(event)
  }

  export function close() {
    magicMenu.close()
  }

  function handleSoldCorrection() {
    close()
    paymentDialog.open(subscribe, 'Correction du solde')
  }

  function closeAfterClick(force = false) {
    if ($isMobile || force) setTimeout(close, 200)
  }
</script>

<PaymentDialog bind:this={paymentDialog} modeCorrection />

<MagicMenu bind:this={magicMenu}>
  <SubscribeMenuList
    {state}
    {subscribe}
    dense={!$isMobile}
    on:soldCorrection={handleSoldCorrection}
    on:roleSelect={() => closeAfterClick()}
    on:tarifSelect={() => closeAfterClick()}
    on:sendMail={() => closeAfterClick(true)}
  />
</MagicMenu>
