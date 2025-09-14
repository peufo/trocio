<script lang="ts">
  import { Card, CardTitle } from '$lib/material'

  import { isMobile } from '$lib/store/layout'
  import { troc } from '$lib/troc/store'
  import TrocCard from '$lib/troc/Card.svelte'
  import Subscribe from '$lib/sub/Subscribe.svelte'
  import ArticlesList from '$lib/article/List.svelte'
  import EnsureSubscribe from '$lib/sub/EnsureSubscribe.svelte'
</script>

{#if $isMobile}
  <div class="pa-2">
    <TrocCard troc={$troc} />

    <EnsureSubscribe troc={$troc} />
  </div>
{:else}
  <div class="layout">
    <div class="troc-card">
      <TrocCard troc={$troc} />
    </div>

    <Card>
      <CardTitle>Mon activité</CardTitle>
      <Subscribe troc={$troc} />
    </Card>

    <Card class="pa-4">
      <ArticlesList trocId={$troc._id} currency={$troc.currency} />
    </Card>
  </div>
{/if}

<style>
  .layout {
    padding: 1em;
    max-width: 1400px;
    margin: auto;
    gap: 1em;
    display: grid;
    grid-template-columns: minmax(340px, auto) minmax(600px, auto);
  }
  .troc-card {
    grid-row: 1 / 3;
  }

  @media only screen and (max-width: 1350px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .troc-card {
      grid-row: 1;
    }
  }
</style>
