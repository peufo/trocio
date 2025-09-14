<script lang="ts">
  import { Button, Icon } from "$lib/material";
  import { createMutation, useQueryClient } from "@tanstack/svelte-query";

  import Template from "$lib/cash/Template.svelte";
  import Loader from "$lib/util/Loader.svelte";
  import { api } from "$lib/api";
  import type { Article } from "$lib/types";
  import TagsPrint from "$lib/troc/TagsPrint.svelte";
  import { troc } from "$lib/troc/store";
  import { mdiTagOutline } from "@mdi/js";

  export let subscribeId: string;
  export let template: Template | undefined = undefined;
  let tagsPrint: TagsPrint;

  let pendingItems: Article[] = [];
  const queryClient = useQueryClient();
  const queryRecover = createMutation({
    mutationFn: () =>
      api<{ articlesId: string[] }, Article[]>("/api/articles/recover", {
        method: "post",
        data: { articlesId: pendingItems.map((art) => art._id) },
        success: `${pendingItems.length} articles récupérés`,
      }),
    onSuccess: () => {
      pendingItems = [];
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["subscribes/resum"] });
      template?.closeSelection();
    },
  });
</script>

<TagsPrint
  bind:this={tagsPrint}
  articles={pendingItems}
  tag={$troc.tag}
  currency={$troc.currency}
/>

<Template
  bind:this={template}
  bind:pendingItems
  queryParams={{
    exact_trocId: $troc._id,
    exact_providerSubId: subscribeId,
    exact_state: "valided",
  }}
  placeholder="Articles validés"
  canSelectAll
  message="Sélectionner des articles invendus pour les rendre au client."
>
  <div slot="actions-selection" class="d-flex align-center" style="gap: 4px;">
    {#if $queryRecover.isPending}
      <Button disabled><Loader /></Button>
    {:else}
      <Button
        fab
        outlined
        size="small"
        title="Imprimer les étiquettes de la sélection"
        class="secondary-color"
        on:click={() => tagsPrint.print()}
      >
        <Icon path={mdiTagOutline} />
      </Button>

      <Button class="primary-color" on:click={() => $queryRecover.mutate()}>
        Rendre
        {pendingItems.length > 1
          ? `les ${pendingItems.length} articles`
          : `l'article`}
      </Button>
    {/if}
  </div>
</Template>
