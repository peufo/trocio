<script lang="ts">
  import { Button } from "$lib/material";
  import { api } from "$lib/api";
  import { troc } from "$lib/troc/store";
  import Tarif from "$lib/troc/Tarif.svelte";
  import { createMutation } from "@tanstack/svelte-query";
  import type { TrocLookup, Tarif as ITarif } from "$lib/types";
  import { param, urlParam } from "$lib/param";
  import { goto } from "$app/navigation";

  const queryCreateTarif = createMutation({
    mutationFn: (data: { trocId: string } & Partial<ITarif>) =>
      api<{}, TrocLookup>(`/api/trocs/tarif`, {
        method: "post",
        data,
        success: "Nouveau tarif créé",
      }),
    onSuccess: troc.set,
  });

  function handleOpen(tarifId?: string) {
    goto($urlParam.with({ tarif_selected: tarifId }));
  }

  function handleClose() {
    goto($urlParam.with({ tarif_selected: "" }));
  }
</script>

<div class="container pb-16">
  <h6 class="mb-5">Edition des tarifs</h6>

  {#each $troc.tarif as tarif (tarif._id)}
    <Tarif
      {tarif}
      class="mb-3"
      open={tarif._id === $param.get("tarif_selected")}
      on:open={() => handleOpen(tarif._id)}
      on:close={handleClose}
    />
  {/each}

  <div class="d-flex">
    <div class="flex-grow-1"></div>
    <Button
      disabled={$queryCreateTarif.isPending}
      depressed
      on:click={() =>
        $queryCreateTarif.mutate(
          {
            trocId: $troc._id,
            name: "Nouveau tarif",
          },
          {
            onSuccess: (newTroc) => {
              const tarif_selected =
                newTroc.tarif[newTroc.tarif.length - 1]._id;
              goto($urlParam.with({ tarif_selected }));
            },
          }
        )}
    >
      +1 tarif
    </Button>
  </div>
</div>

<style>
  .container {
    max-width: 700px;
    margin: auto;
  }
</style>
