<script lang="ts">
  import { faCubes } from '@fortawesome/free-solid-svg-icons'
  import { url } from '@roxi/routify'

  import { Card, CardTitle, Button } from '$material'
  import IconLink from '$lib/util/IconLink.svelte'
  import { useApi } from '$lib/api'
  import type { ArticleState } from 'types'
  import ArticlesButton from '$lib/troc/home/ArticlesButton.svelte'

  export let trocId: string

  $: query = useApi<{ trocId: string }, Record<ArticleState | 'total', number>>(
    ['/articles/counts-by-state', { trocId }]
  )
</script>

{#if $query.data}
  <Card>
    <CardTitle class="mr-4">
      <Button
        href={$url('./management_articles', { trocId })}
        title="Acceder à la gestion des articles"
        depressed
      >
        <IconLink icon={faCubes} class="mr-4" opacity />
        Articles
      </Button>

      <div class="flex-grow-1" />
      {$query.data.total}
    </CardTitle>
    <div class="articles-flow pa-4">
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

<style lang="scss" global>
  $column-gap: 1em;
  $row-gap: 1.88em;
  $line: 2px;

  .articles-flow {
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: $row-gap;
    column-gap: $column-gap;
    justify-items: stretch;

    div {
      position: relative;
    }

    [data-state='refused'],
    [data-state='recover'] {
      transform: translateY(calc(50% + $row-gap / 2));
    }

    [data-state='proposed']::before,
    [data-state='valided']::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100%;
      height: 100%;
      border-bottom: var(--theme-chips) solid $line;
      border-left: var(--theme-chips) solid $line;
      border-radius: calc($row-gap / 2);
    }

    [data-state='proposed']::after,
    [data-state='valided']::after {
      content: '';
      position: absolute;
      top: 100%;
      height: 100%;
      right: 50%;
      border-right: var(--theme-chips) solid $line;
    }
  }
</style>
