<script lang="ts">
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";

  import { Dialog, Button, Textarea, TextField } from "$lib/material";
  import { api } from "$lib/api";
  import Loader from "$lib/util/Loader.svelte";
  import type { IPaymentCreate, SubscribeLookup } from "$lib/types";

  export let active = false;
  export let modeCorrection = false;
  export let rows = 2;

  let subscribe: SubscribeLookup | undefined;
  let message = "";
  let amount = "0";
  let button: HTMLButtonElement;

  const queryClient = useQueryClient();

  export function open(
    sub: SubscribeLookup | undefined,
    _message = "",
    _amount = 0
  ) {
    subscribe = sub;
    message = _message;
    amount = String(Math.round(_amount * 100) / 100);
    if (!subscribe) return (active = false);
    active = true;
    setTimeout(() => {
      if (button) button.focus();
    });
  }

  export function close() {
    active = false;
    subscribe = undefined;
    message = "";
    amount = "0";
  }

  const queryPayment = createMutation({
    mutationFn: () =>
      api<IPaymentCreate>("/api/payments", {
        method: "post",
        data: {
          userSubId: subscribe?._id,
          amount: +amount,
          message,
        },
        success: "Transaction enregistrée",
      }),
    onSuccess: () => {
      active = false;
      queryClient.invalidateQueries({ queryKey: ["subscribes"] });
      queryClient.invalidateQueries({ queryKey: ["subscribes/resum"] });
    },
  });
</script>

{#if subscribe}
  <Dialog bind:active class="pa-4">
    <div class="text-h6">
      {modeCorrection ? "Correction" : "Règlement"} du solde de
      <b>{subscribe.user?.name || subscribe.name}</b>
    </div>
    <form on:submit|preventDefault={() => $queryPayment.mutate()}>
      <div class="mt-3">
        <Textarea bind:value={message} {rows} autogrow color="secondary">
          Commentaire
        </Textarea>
      </div>

      <div class="d-flex mt-3" style="gap: 0.5em;">
        <TextField
          bind:value={amount}
          type="number"
          hint={+amount > 0 === modeCorrection
            ? "En faveur du client"
            : "En faveur du troc"}
          color="secondary"
          step="0.01"
        >
          Montant
        </TextField>

        <div class="flex-grow-1"></div>

        {#if $queryPayment.isPending}
          <Button outlined disabled>
            <Loader />
          </Button>
        {:else}
          <Button class="primary-color" type="submit" bind:button>
            Valider
          </Button>
        {/if}
      </div>
    </form>
  </Dialog>
{/if}
