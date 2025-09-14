<script lang="ts">
  import type { Option } from "$lib/types";
  import { Card, Button, TextField } from "$lib/material";
  import { createMutation } from "@tanstack/svelte-query";
  import { api } from "$lib/api";

  export let option: Option;
  let shadowValue = option.value;

  const querySave = createMutation<Option, unknown, string>({
    mutationFn: (value: string) =>
      api("/api/root/options", {
        method: "post",
        data: { ...option, value },
        success: "Option mise à jour",
      }),
    onSuccess: (data) => {
      option = data;
    },
  });

  function handleSave() {
    $querySave.mutate(shadowValue);
  }

  function handleCancel() {
    shadowValue = option.value;
  }
</script>

<Card class="pa-6 pt-8">
  <TextField bind:value={shadowValue}>{option.name}</TextField>

  <div class="d-flex pt-2">
    <div class="text-caption">
      {option.description}
      <br />
      Création: {new Date(option.createdAt).toLocaleString()}
      <br />
      Modification: {new Date(option.updatedAt).toLocaleString()}
    </div>
    <div class="flex-grow-1"></div>
    {#if shadowValue !== option.value && !$querySave.isPending}
      <Button class="mr-3" on:click={handleCancel}>Annuler</Button>
      <Button class="primary-color" on:click={handleSave}>Save</Button>
    {/if}
  </div>
</Card>
