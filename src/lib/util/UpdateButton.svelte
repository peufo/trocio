<script lang="ts">
  import { slide } from "svelte/transition";
  import { Button } from "$lib/material";
  import type { CreateMutationResult } from "@tanstack/svelte-query";
  import Loader from "./Loader.svelte";

  export let visible = false;
  export let updateQuery: CreateMutationResult<any, unknown, any>;
  export let clickHandler = $updateQuery.mutate;
</script>

{#if visible}
  <div transition:slide|local class="d-flex">
    <div class="flex-grow-1"></div>
    <Button
      disabled={$updateQuery.isPending}
      on:click={clickHandler}
      class="primary-color"
    >
      {#if $updateQuery.isPending}
        <Loader title="Validation" />
      {:else}
        Valider
      {/if}
    </Button>
    <br /><br />
  </div>
{/if}
