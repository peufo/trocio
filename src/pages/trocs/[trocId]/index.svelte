<script lang="ts">
  import { Card, CardTitle } from 'svelte-materialify'

  import { isMobile } from '$lib/store/layout'
  import { troc } from '$lib/troc/store'
  import TrocCard from '$lib/troc/Card.svelte'
  import SubActivity from '$lib/sub/Activity.svelte'
  import Subscribe from '$lib/sub/Subscribe.svelte'
  import ArticlesList from '$lib/article/List.svelte'
</script>

{#if $isMobile}
  <!--<div class="centered pa-1" style="height: 85vh;">-->
  <TrocCard troc={$troc} />
{:else}
  <div class="layout">
    <div class="troc-card">
      <TrocCard troc={$troc} />
    </div>

    <Card>
      <CardTitle>Mon activité</CardTitle>
      <div class="pa-4">
        <Subscribe troc={$troc} />
      </div>
    </Card>

    <Card class="pa-4">
      <ArticlesList trocId={$troc._id} currency={$troc.currency} />
    </Card>
  </div>
{/if}

<style>
  .layout {
    padding: 1em;
    max-width: 1200px;
    margin: auto;
    gap: 1em;
    display: grid;
    grid-template-columns: 340px 1fr;
  }
  .troc-card {
    grid-row: 1 / 3;
  }
</style>
