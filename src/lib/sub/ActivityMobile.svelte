<script lang="ts">
  import { fade, slide } from 'svelte/transition'
  import { Button, Card, Icon } from 'svelte-materialify'
  import { mdiPrinter } from '@mdi/js'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'

  import type { SubscribeResum } from 'types'
  import { renderAmount } from '$lib/utils'
  import ArticleCreateDialog from '$lib/article/CreateDialog.svelte'
  import ArticleProvidedTable from '$lib/article/ProvidedTable.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import TarifInfoDialog from '$lib/troc/TarifInfoDialog.svelte'
  import { useApi } from '$lib/api'
  import TablePurchases from './TablePurchases.svelte'
  import TablePayments from './TablePayments.svelte'

  export let subscribeId: string
  export let currency: string | undefined = undefined
  /** Affiche le bouton du reglement du sold et les fonctions d'anulation d'évenement sur les articles*/
  export let modeAdmin = false

  type OpenType = 'sales' | 'buys' | 'payments'
  export let open: null | OpenType = null

  let klass = ''
  export { klass as class }

  let articleCreateDialogActive = false
  let tarifInfoDialogActive = false

  $: queryResum = useApi<{ subscribeId: string }, SubscribeResum>([
    'subscribes/resum',
    { subscribeId },
  ])
  $: resum = $queryResum.data?.resum

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  function handleClick(key: OpenType) {
    if (open === key) open = null
    else open = key
  }
</script>

<ArticleCreateDialog {subscribeId} bind:active={articleCreateDialogActive} />

<TarifInfoDialog
  tarif={$queryResum.data?.tarif}
  bind:active={tarifInfoDialogActive}
  {modeAdmin}
/>

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
    <!-- En-tête -->
    <div class="centered pa-4">
      <div class="text-center">
        <span style="display: block; transform: translateY(5px);">Solde</span>
        <h4>{renderAmount(resum.balance, currency)}</h4>
      </div>
    </div>

    <!-- Ventes -->
    <Card outlined>
      <div on:click={() => handleClick('sales')} class="card-header d-flex">
        <div>
          {resum.providedCount || 0}
          Vente{(resum.providedCount || 0) > 1 ? 's' : ''}
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
        <div class="card-content" transition:slide|local>
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

    <!-- Fond de page -->
    <div>
      <a href={`/print-subscribe?subscribeId=${subscribeId}`} target="_blank">
        <Button text size="small" style="opacity: 0.6;">
          <Icon path={mdiPrinter} size="1.1em" class="mr-2" />
          Version imprimable
        </Button>
      </a>
    </div>
  </div>
{/if}

<style>
  .card-header {
    font-size: large;
    padding: 12px;
  }
</style>
