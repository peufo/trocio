<script lang="ts">
  import type { SubscribeLookup } from 'types'
  import MagicMenu from '$lib/util/MagicMenu.svelte'
  import { isMobile } from '$lib/store/layout'
  import SubscribeMenuList from './SubscribeMenuList.svelte'
  import PaymentDialog from '$lib/cash/PaymentDialog.svelte'
  import PrefixDialog from '$lib/user/PrefixDialog.svelte'
  import StaffNoteDialog from '$lib/user/StaffNoteDialog.svelte'

  export let state: 'main' | 'role' | 'tarif' = 'main'
  export let subscribe: SubscribeLookup | undefined = undefined

  let paymentDialog: PaymentDialog
  let prefixDialog: PrefixDialog
  let staffNoteDialog: StaffNoteDialog

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

  function handlePrefixClick() {
    console.log(subscribe)
    if (!subscribe) return
    close()
    prefixDialog.open(subscribe)
  }

  function handleNoteClick() {
    if (!subscribe) return
    close()
    staffNoteDialog.open(subscribe)
  }

  function closeAfterClick(force = false) {
    if ($isMobile || force) setTimeout(close, 200)
  }
</script>

<PaymentDialog bind:this={paymentDialog} modeCorrection />

<PrefixDialog bind:this={prefixDialog} />

<StaffNoteDialog bind:this={staffNoteDialog} />

<MagicMenu bind:this={magicMenu}>
  <SubscribeMenuList
    {state}
    {subscribe}
    dense={!$isMobile}
    on:soldCorrection={handleSoldCorrection}
    on:prefixClick={handlePrefixClick}
    on:noteClick={handleNoteClick}
    on:roleSelect={() => closeAfterClick()}
    on:tarifSelect={() => closeAfterClick()}
    on:sendMail={() => closeAfterClick(true)}
  />
</MagicMenu>
