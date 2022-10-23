<script lang="ts">
  import { useApi } from '$lib/api'
  import TimeLine from '$lib/util/TimeLine.svelte'
  import { renderAmount } from '$lib/utils'
  import type {
    ArticleCorrection,
    ArticleCorrectionLookup,
    ArticleCorrectionsLookup,
    ArticleLookup,
  } from 'types'

  export let article: ArticleLookup | undefined

  const titles: { [key in ArticleCorrection['event']]: string } = {
    'edit-name': 'Changement du nom',
    'edit-price': 'Changement du prix',
    'cancel-recover': 'Annulation de la récupération',
    'cancel-refused': 'Annulation du refus',
    'cancel-sold': 'Annulation de la vente',
    'cancel-valided': 'Annulation de la validation',
  }

  function getDetail(correction: ArticleCorrectionLookup): string {
    let title = ''
    if (correction.event === 'edit-price') {
      title += `de ${renderAmount(correction.oldValue)} `
      title += `à ${renderAmount(correction.newValue)} `
    }
    if (correction.event === 'edit-name') {
      title += `de "${correction.oldValue}" `
      title += `à "${correction.newValue}" `
    }
    title += `par ${correction.author.name}`
    return title
  }

  $: queryCorrections = article
    ? useApi<{ articleId: string }, ArticleCorrectionsLookup>([
        'articles/corrections',
        { articleId: article?._id },
      ])
    : null

  $: corrections = $queryCorrections?.data?.corrections || []

  $: events = corrections.map((correction) => ({
    time: correction.timestamp,
    title: titles[correction.event],
    detail: getDetail(correction),
  }))
</script>

{#if events.length}
  <TimeLine {events} />
{:else}
  <div class="pa-4 text-caption">
    Aucune édition n'a été effectuée sur cette article
  </div>
{/if}
