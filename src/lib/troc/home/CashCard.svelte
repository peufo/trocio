<script lang="ts">
  import { url } from '@roxi/routify'

  import { Card, CardTitle, CardSubtitle, Button } from '$material'
  import IconLink from '$lib/util/IconLink.svelte'
  import { renderAmount } from '$lib/utils'
  import { useApi } from '$lib/api'
  import {
    faArrowRightToBracket,
    faArrowUpFromBracket,
    faCashRegister,
  } from '@fortawesome/free-solid-svg-icons'

  export let trocId: string
  export let currency: string

  interface ResumCount {
    paymentCount: number
    paymentSum: number
    positiveCount: number
    positiveSum: number
    negativeCount: number
    negativeSum: number
    benefit: number
    benefitMargin: number
    benefitFee: number
  }

  $: query = useApi<{ trocId: string }, ResumCount>([
    '/subscribes/resum/counts',
    { trocId },
  ])
  $: resum = $query.data || null
</script>

{#if resum}
  <Card>
    <CardTitle>
      <Button
        href={$url('./cash_register', { trocId })}
        title="Acceder à la caisse"
        depressed
      >
        <IconLink icon={faCashRegister} class="mr-4" opacity />
        Caisse
      </Button>

      <div class="flex-grow-1" />
      <span title="Contenu de la caisse">
        {renderAmount(resum.paymentSum, currency)}
      </span>
    </CardTitle>
    <CardSubtitle class="d-flex">
      <div class="flex-grow-1" />
      <span
        title={[
          `Frais de dépot : ${renderAmount(resum.benefitMargin, currency)}`,
          `Marge à la vente : ${renderAmount(resum.benefitFee, currency)}`,
        ].join('\n')}
      >
        Bénéfice {renderAmount(resum.benefit, currency)}
      </span>
    </CardSubtitle>

    <div class="pa-4 d-flex flex-column" style="gap: 0.5em; margin-top: 12px;">
      <div>
        <Button
          depressed
          style="width: 100%;"
          href={$url('/admin/management_users', {
            trocId,
            'min_resum.balance': 0.01,
            'sort_resum.balance': -1,
          })}
        >
          <IconLink
            icon={faArrowUpFromBracket}
            class="mr-2"
            size="1.2em"
            opacity
          />
          Solde{resum.positiveCount > 1 ? 's' : ''} en faveur du client
          <div class="flex-grow-1" />
          {resum.positiveCount}
        </Button>

        <CardSubtitle class="d-flex pa-0">
          <div class="flex-grow-1" />
          {renderAmount(-resum.positiveSum, currency)}
        </CardSubtitle>
      </div>

      <div>
        <Button
          depressed
          style="width: 100%;"
          href={$url('/admin/management_users', {
            trocId,
            'max_resum.balance': -0.01,
            'sort_resum.balance': 1,
          })}
        >
          <IconLink
            icon={faArrowRightToBracket}
            class="mr-2"
            size="1.2em"
            opacity
            style="transform: rotate(90deg);"
          />
          Solde{resum.negativeCount > 1 ? 's' : ''} en votre faveur
          <div class="flex-grow-1" />
          {resum.negativeCount}
        </Button>

        <CardSubtitle class="d-flex pa-0">
          <div class="flex-grow-1" />
          {renderAmount(-resum.negativeSum, currency)}
        </CardSubtitle>
      </div>
    </div>
  </Card>
{/if}
