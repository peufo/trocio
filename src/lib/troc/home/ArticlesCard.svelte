<script lang="ts">
  import { Card, CardTitle, Button } from 'svelte-materialify'
  import { url } from '@roxi/routify'
  import { faCubes } from '@fortawesome/free-solid-svg-icons'

  import IconLink from '$lib/util/IconLink.svelte'
  import { useApi } from '$lib/api'
  import type { ArticleState } from 'types'
  import ArticlesButton from '$lib/troc/home/ArticlesButton.svelte'

  export let trocId: string

  $: query = useApi<{ trocId: string }, Record<ArticleState | 'total', number>>(
    ['/articles/counts', { trocId }]
  )
</script>

{#if $query.data}
  <Card>
    <CardTitle>
      <IconLink icon={faCubes} class="mr-4" />
      {$query.data.total} Articles
    </CardTitle>
    <div class="articles-flow pl-4 pr-4 pb-4">
      <ArticlesButton
        label="Proposé"
        state="proposed"
        count={$query.data.proposed}
        {trocId}
      />
      <ArticlesButton
        label="Refusé"
        state="refused"
        count={$query.data.refused}
        {trocId}
      />
      <ArticlesButton
        label="Validé"
        state="valided"
        count={$query.data.valided}
        {trocId}
      />
      <ArticlesButton
        label="Récupéré"
        state="recover"
        count={$query.data.recover}
        {trocId}
      />
      <ArticlesButton
        label="Vendu"
        state="sold"
        count={$query.data.sold}
        {trocId}
      />

      <br />
    </div>
  </Card>
{/if}

<style lang="scss">
  .articles-flow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 1em;
    justify-items: stretch;

    [data-state='refused'] {
      transform: translateY(10px);
    }
  }
</style>
