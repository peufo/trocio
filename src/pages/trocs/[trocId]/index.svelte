<script lang="ts">
  import { isMobile } from '$lib/store/layout'
  import { troc } from '$lib/troc/store'
  import TrocCard from '$lib/troc/Card.svelte'
  import UserResum from '$lib/troc/UserResum.svelte'
  import ArticlesList from '$lib/article/List.svelte'
</script>

{#if $isMobile}
  <!--<div class="centered pa-1" style="height: 85vh;">-->
  <TrocCard troc={$troc} />
{:else}
  <div class="layout">
    <TrocCard troc={$troc} />
    <UserResum subscribeId={$troc.subscribe._id} />
    <ArticlesList trocId={$troc._id} currency={$troc.currency} />
  </div>
{/if}

<style>
  .layout {
    padding: 1em;
    gap: 1em;
    display: grid;
    grid-template-columns: 340px 1fr;
  }
</style>
