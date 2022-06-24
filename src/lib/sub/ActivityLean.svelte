<script lang="ts">
  import { fade } from 'svelte/transition'
  import { Button, Card, Icon, Table } from 'svelte-materialify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { mdiFileDownloadOutline, mdiPrinter } from '@mdi/js'
  import { faPlus } from '@fortawesome/free-solid-svg-icons'
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
  import 'dayjs/locale/fr'

  import type { SubscribeResum } from 'types'
  import { renderAmount } from '$lib/utils'
  import ArticleProvidedTable from '$lib/article/ProvidedTable.svelte'
  import ArticleCreateDialog from '$lib/article/CreateDialog.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import TarifInfoDialog from '$lib/troc/TarifInfoDialog.svelte'
  import DetailCard from '$lib/util/DetailCard.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import { api, useApi } from '$lib/api'
  import notify from '$lib/notify'

  export let subscribeId: string
  export let isClosed = false
  export let currency: string | undefined = undefined
  /** Affiche le bouton du reglement du sold et les fonctions d'anulation d'évenement sur les articles*/
  export let modeAdmin = false

  let klass = ''
  export { klass as class }

  let articleCreateDialogActive = false
  let tarifInfoDialogActive = false
  let providedOpen = false
  let paymentOpen = false

  $: queryResum = useApi<{ subscribeId: string }, SubscribeResum>([
    'subscribes/resum',
    { subscribeId },
  ])
  $: resum = $queryResum.data?.resum

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  function clickDownladCSV() {
    notify.info('Fonctionnalité à venir')
  }

  function clickOpenCreateArticle() {
    providedOpen = true
    articleCreateDialogActive = true
  }

  function clickOpenTarifInfo() {
    tarifInfoDialogActive = true
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
        <span style="display: block; transform: translateY(5px);"> Solde </span>
        <h4>{renderAmount(resum.balance, currency)}</h4>
      </div>
    </div>

    <!-- Ventes -->
    <Card outlined class="pa-4">
      <div class="card-content d-flex">
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
    </Card>

    <!-- Achats -->
    <Card outlined class="pa-4">
      <div class="card-content d-flex">
        <div>
          {resum.purchasesCount || 0}
          Achat{(resum.purchasesCount || 0) > 1 ? 's' : ''}
        </div>
        <div class="flex-grow-1" />
        <div>
          {renderAmount(-(resum.purchasesSum || 0), currency)}
        </div>
      </div>
    </Card>

    <!-- Paiements -->
    <Card outlined class="pa-4">
      <div class="card-content d-flex">
        <div>
          {resum.paymentsCount || 0}
          Paiement{(resum.paymentsCount || 0) > 1 ? 's' : ''}
        </div>
        <div class="flex-grow-1" />
        <div>
          {renderAmount(resum.paymentsSum || 0, currency)}
        </div>
      </div>
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
  .card-content {
    font-size: large;
  }
</style>
