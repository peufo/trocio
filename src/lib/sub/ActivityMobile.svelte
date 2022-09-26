<script lang="ts">
  import { fade, slide } from 'svelte/transition'
  import { Card } from 'svelte-materialify/src'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'

  import type { SubscribeResum } from 'types'
  import { renderAmount } from '$lib/utils'
  import ArticleEditDialog from '$lib/article/EditDialog.svelte'
  import ArticleProvidedTable from '$lib/article/ProvidedTable.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import TarifInfoDialog from '$lib/troc/TarifInfoDialog.svelte'
  import { useApi } from '$lib/api'
  import TablePurchases from './TablePurchases.svelte'
  import TablePayments from './TablePayments.svelte'

  export let subscribeId: string
  export let currency: string | undefined = undefined
  export let createArticleDisabled = false
  /** Affiche le bouton du reglement du sold et les fonctions d'anulation d'évenement sur les articles */
  export let modeAdmin = false

  type OpenType = 'sales' | 'buys' | 'payments'
  export let open: null | OpenType = null

  let klass = ''
  export { klass as class }

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

  function handleClick(key: OpenType) {
    if (open === key) open = null
    else open = key
  }
</script>

{#if $queryResum.isLoading}
  <div in:fade|local class="centered" style="height: 85vh;">
    <Loader />
  </div>
{:else if $queryResum.isError}
  <div in:fade|local class="centered" style="height: 85vh;">
    Oups, une erreur est survenu.
  </div>
{:else if $queryResum.isSuccess && resum}
  <div in:fade|local class="d-flex flex-column {klass} pa-2" style="gap: 1em;">
    <!-- Solde total -->
    <div class="centered pa-4">
      <div class="text-center">
        <span style="display: block; transform: translateY(5px);">Solde</span>
        <h4>{renderAmount(resum.balance, currency)}</h4>
      </div>
    </div>

    <!-- Nouvelle proposition + tarif-->
    <div class="d-flex">
      <div class="flex-grow-1" />
      <TarifInfoDialog tarif={$queryResum.data?.tarif} {modeAdmin} />
      <ArticleEditDialog
        {subscribeId}
        fullscreen
        disabled={createArticleDisabled}
      />
    </div>

    <!-- Propositions -->
    <Card outlined>
      <div on:click={() => handleClick('sales')} class="card-header d-flex">
        <div>
          {totalProposedCount}
          Proposition{totalProposedCount > 1 ? 's' : ''}
        </div>
        <div class="flex-grow-1" />
        <div>
          {renderAmount(
            (resum.soldSum || 0) - (resum.feeSum || 0) - (resum.marginSum || 0),
            currency
          )}
        </div>
      </div>

      {#if open === 'sales'}
        <div transition:slide|local class="card-content">
          <ArticleProvidedTable {modeAdmin} {subscribeId} on:openTarifDialog />
        </div>
      {/if}
    </Card>

    <!-- Achats -->
    <Card outlined>
      <div on:click={() => handleClick('buys')} class="card-header d-flex">
        <div>
          {resum.purchasesCount || 0} Achat{(resum.purchasesCount || 0) > 1
            ? 's'
            : ''}
        </div>
        <div class="flex-grow-1" />
        <div>
          {renderAmount(-(resum.purchasesSum || 0), currency)}
        </div>
      </div>
      {#if open === 'buys'}
        <div class="card-content" transition:slide|local>
          <TablePurchases purchases={resum.purchases || []} />
        </div>
      {/if}
    </Card>

    <!-- Paiements -->
    <Card outlined>
      <div on:click={() => handleClick('payments')} class="card-header d-flex">
        <div>
          {resum.paymentsCount || 0}
          Paiement{(resum.paymentsCount || 0) > 1 ? 's' : ''}
        </div>
        <div class="flex-grow-1" />
        <div>
          {renderAmount(resum.paymentsSum || 0, currency)}
        </div>
      </div>
      {#if open === 'payments'}
        <div class="card-content" transition:slide|local>
          <TablePayments payments={resum.payments || []} />
        </div>
      {/if}
    </Card>
  </div>
{/if}

<style>
  .card-header {
    font-size: large;
    padding: 12px;
  }
</style>
