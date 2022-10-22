<script lang="ts">
  import type { ArticleLookup } from 'types'
  import { renderAmount } from '$lib/utils'
  import TimeLine from '$lib/util/TimeLine.svelte'

  export let article: ArticleLookup

  const intl = new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  })

  const events = [
    {
      title: 'Proposé',
      time: article.createdAt,
      detail: `par ${article.provider?.name || article.providerSub?.name}
        pour ${renderAmount(article.price)}`,
    },
  ]

  if (article.valided)
    events.push({
      title: 'Validé',
      time: article.valided,
      detail: `par ${article.validator?.name}`,
    })

  if (article.refused)
    events.push({
      title: 'Refusé',
      time: article.refused,
      detail: `par ${article.validator?.name}`,
    })

  if (article.sold)
    events.push({
      title: 'Vendu',
      time: article.sold,
      detail: `par ${article.seller?.name} à ${
        article.buyer?.name || article.buyerSub?.name
      }`,
    })

  if (article.recover)
    events.push({
      title: 'Récupèré',
      time: article.recover,
      detail: `par ${article.seller?.name}`,
    })
</script>

<TimeLine {events} />
