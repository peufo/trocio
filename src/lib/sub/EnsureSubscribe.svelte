<script lang="ts">
  /** Affiche soit le bouton pour participer, soit l'activité d'un utilisateur sur un troc */
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";
  import { Button } from "$lib/material";
  import { fade } from "svelte/transition";

  import { user } from "$lib/user/store";
  import { api } from "$lib/api";
  import type { SubscribeBase, SubscribeLookup, TrocLookup } from "$lib/types";
  import { goto } from "$app/navigation";

  export let troc: TrocLookup;

  const queryClient = useQueryClient();

  const createSubscribe = createMutation({
    mutationFn: (data: SubscribeBase) =>
      api<SubscribeBase, SubscribeLookup>("/api/subscribes", {
        method: "post",
        data,
        success: () => {
          queryClient.invalidateQueries({ queryKey: ["subscribes/me"] });
          return "Nouvelle participation";
        },
      }),
  });

  function handleClickActivity() {
    if (!$user) {
      goto(`/login?callback=/trocs/${troc._id}/activity`);
      return;
    }
    $createSubscribe.mutate(
      { trocId: troc._id },
      {
        onSuccess: (subscribe) => {
          if (subscribe) troc.subscribe = subscribe;
          goto(`/trocs/${troc._id}/activity`);
        },
      }
    );
  }
</script>

{#if troc.subscribe?.validedByUser}
  <div in:fade|local>
    <slot />
  </div>
{:else}
  <div class="button-container">
    <Button
      on:click={handleClickActivity}
      depressed
      class="primary-color"
      disabled={$createSubscribe.isPending}
    >
      Je veux participer à ce troc
    </Button>
  </div>
{/if}

<style>
  .button-container {
    height: 100px;
    display: grid;
    align-content: center;
    justify-content: center;
  }
</style>
