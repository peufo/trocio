<script lang="ts">
  import type { SubscribeLookup } from "$lib/types";
  import MagicMenu from "$lib/util/MagicMenu.svelte";
  import { isMobile } from "$lib/store/layout";
  import SubscribeMenuList from "./SubscribeMenuList.svelte";
  import PaymentDialog from "$lib/cash/PaymentDialog.svelte";
  import PrefixDialog from "$lib/user/PrefixDialog.svelte";

  export let state: "main" | "role" | "tarif" = "main";
  export let subscribe: SubscribeLookup | undefined = undefined;

  let paymentDialog: PaymentDialog;
  let prefixDialog: PrefixDialog;

  let magicMenu: MagicMenu;

  export function open(event: MouseEvent, sub: SubscribeLookup) {
    state = "main";
    subscribe = sub;
    magicMenu.open(event);
  }

  export function close() {
    magicMenu.close();
  }

  function handleSoldCorrection() {
    close();
    paymentDialog.open(subscribe, "Correction du solde");
  }

  function handlePrefixClick() {
    console.log(subscribe);
    if (!subscribe) return;
    close();
    prefixDialog.open(subscribe);
  }

  function closeAfterClick(force = false) {
    if ($isMobile || force) setTimeout(close, 200);
  }
</script>

<PaymentDialog bind:this={paymentDialog} modeCorrection />

<PrefixDialog bind:this={prefixDialog} />

<MagicMenu bind:this={magicMenu}>
  <SubscribeMenuList
    {state}
    {subscribe}
    dense={!$isMobile}
    on:soldCorrection={handleSoldCorrection}
    on:prefixClick={handlePrefixClick}
    on:roleSelect={() => closeAfterClick()}
    on:tarifSelect={() => closeAfterClick()}
    on:sendMail={() => closeAfterClick(true)}
  />
</MagicMenu>
