<script lang="ts">
  import { fly } from "svelte/transition";

  import { isMobile, isKeyboardOpen } from "$lib/store/layout";
  import { troc, trocs } from "$lib/troc/store";
  import Loader from "$lib/util/Loader.svelte";
  import TabsTroc from "$lib/troc/TabsTroc.svelte";
  import type { TrocLookup } from "$lib/types";
  import { useApi } from "$lib/api";
  import { page } from "$app/state";

  $: trocQuery = useApi<{ trocId: string }, TrocLookup>({
    queryKey: ["trocs/byId", { trocId: page.params.trocId || "" }],
  });

  // Nécéssaire pour mettre à jour le point sur la map
  $: $trocs = $trocQuery.data ? [$trocQuery.data] : [];
  $: $troc = $trocs[0];
</script>

<svelte:head>
  <meta
    name="title"
    content="Trocio{$trocs[0]?.name ? ` ⋅ ${$trocs[0]?.name}` : ''}"
  />
</svelte:head>

{#if $trocQuery.isPending}
  <div class="centered" style="height: 85vh;">
    <Loader />
  </div>
{:else if $trocQuery.isError}
  <div class="centered" style="height: 85vh;">
    <div>
      <p>Aucun troc ne correspond à l'ID "{page.params.trocId}"</p>
      <a href="/trocs">Retour</a>
    </div>
  </div>
{:else}
  <slot />
{/if}

{#if $isMobile && !$isKeyboardOpen}
  <nav out:fly|local={{ y: 72 }}>
    <TabsTroc />
  </nav>
{/if}

<style>
  nav {
    position: fixed;
    bottom: 0;
    width: 100%;
    height: 72px;
  }
</style>
