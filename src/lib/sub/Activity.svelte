<script lang="ts">
  import { fade } from 'svelte/transition'
  import { Button, Icon } from 'svelte-materialify/src'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { mdiFileDownloadOutline, mdiPrinter } from '@mdi/js'
  import 'dayjs/locale/fr'

  import type { IPaymentCreate, SubscribeResum } from 'types'
  import { renderAmount } from '$lib/utils'
  import ArticleProvidedTable from '$lib/article/ProvidedTable.svelte'
  import TablePurchases from './TablePurchases.svelte'
  import TablePayments from './TablePayments.svelte'
  import ArticleEditDialog from '$lib/article/EditDialog.svelte'
  import TarifInfoDialog from '$lib/troc/TarifInfoDialog.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import DetailCard from '$lib/util/DetailCard.svelte'
  import { api, useApi } from '$lib/api'
  import notify from '$lib/notify'

  export let subscribeId: string
  /** Affiche le bouton du reglement du sold et les fonctions d'anulation d'évenement sur les articles*/
  export let modeAdmin = false
  export let createArticleDisabled = false

  let klass = ''
  export { klass as class }

  let providedOpen = false
  let paymentOpen = false
  const queryClient = useQueryClient()

  $: queryResum = useApi<{ subscribeId: string }, SubscribeResum>([
    'subscribes/resum',
    { subscribeId },
  ])
  $: resum = $queryResum.data?.resum
  $: totalProposedCount =
    (resum?.proposedCount || 0) +
    (resum?.validedCount || 0) +
    (resum?.soldCount || 0) +
    (resum?.refusedCount || 0)

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  function clickDownladCSV() {
    notify.info('Fonctionnalité à venir')
  }
</script>

{#if $queryResum.isLoading}
  <div in:fade|local class="centered" style="height: 160px;">
    <Loader />
  </div>
{:else if $queryResum.isError}
  <div in:fade|local class="centered" style="height: 160px;">
    Oups, une erreur est survenu.
  </div>
{:else if $queryResum.isSuccess && resum}
  <div in:fade|local class="d-flex flex-column {klass}" style="gap: 1em;">
    <div class="d-flex align-center">
      <a href={`/print-subscribe?subscribeId=${subscribeId}`} target="_blank">
        <Button text size="small" style="opacity: 0.6;">
          <Icon path={mdiPrinter} size="1.1em" class="mr-2" />
          Version imprimable
        </Button>
      </a>

      <div class="flex-grow-1" />

      <h6 class="mr-1">
        <span class="mr-2">Solde</span>
        {renderAmount(resum.balance)}
      </h6>
    </div>

    <DetailCard
      title="Proposition{totalProposedCount > 1 ? 's' : ''}"
      bind:open={providedOpen}
      count={totalProposedCount}
      sum={(resum.soldSum || 0) - (resum.feeSum || 0) - (resum.marginSum || 0)}
    >
      <span slot="head">
        <!-- Provide button -->
        <span style="margin-left: 30px;">
          {#if !modeAdmin}
            <ArticleEditDialog {subscribeId} disabled={createArticleDisabled} />
          {/if}

          <TarifInfoDialog tarif={$queryResum.data?.tarif} {modeAdmin} />

          <!-- Bouton pour télécharger le fichier .csv -->
          {#if resum.proposedCount}
            <Button
              fab
              text
              size="small"
              on:click={clickDownladCSV}
              title="Télécharger les données des articles proposés"
              style="opacity: .8;"
            >
              <Icon size=".8em" path={mdiFileDownloadOutline} />
            </Button>
          {/if}
        </span>
      </span>

      <ArticleProvidedTable {modeAdmin} {subscribeId} on:openTarifDialog />
    </DetailCard>

    <DetailCard
      title="Achat{(resum.purchasesCount || 0) > 1 ? 's' : ''}"
      count={resum.purchasesCount || 0}
      sum={-(resum.purchasesSum || 0)}
    >
      <TablePurchases purchases={resum.purchases || []} />
    </DetailCard>

    <DetailCard
      title="Paiement{(resum.paymentsCount || 0) > 1 ? 's' : ''}"
      count={resum.paymentsCount || 0}
      sum={resum.paymentsSum || 0}
      open={paymentOpen}
    >
      <TablePayments payments={resum.payments || []} />
    </DetailCard>
  </div>
{/if}
