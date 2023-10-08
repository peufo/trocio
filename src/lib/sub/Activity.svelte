<script lang="ts">
  import { fade } from 'svelte/transition'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'
  import { mdiPrinter } from '@mdi/js'
  import { faDownload } from '@fortawesome/free-solid-svg-icons'

  import { Button, Icon, Menu, List, ListItem } from '$material'
  import type { SubscribeResum } from 'types'
  import { renderAmount } from '$lib/utils'
  import ArticleProvidedTable from '$lib/article/ProvidedTable.svelte'
  import TablePurchases from './TablePurchases.svelte'
  import TablePayments from './TablePayments.svelte'
  import ArticleEditDialog from '$lib/article/EditDialog.svelte'
  import TarifInfoDialog from '$lib/troc/TarifInfoDialog.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import DetailCard from '$lib/util/DetailCard.svelte'
  import { useApi } from '$lib/api'
  import downloadCSV from '$lib/downloadCSV'
  import IconLink from '$lib/util/IconLink.svelte'

  export let subscribeId: string
  /** Affiche le bouton du reglement du sold et les fonctions d'anulation d'évenement sur les articles*/
  export let modeAdmin = false
  export let createArticleDisabled = false

  let klass = ''
  export { klass as class }

  let providedOpen = false
  let paymentOpen = false

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
  <div in:fade|local class="d-flex flex-column pa-4 {klass}" style="gap: 1em;">
    <div class="d-flex align-center" style="gap: 0.5em;">
      <a href={`/print-subscribe?subscribeId=${subscribeId}`} target="_blank">
        <Button text size="small" style="opacity: 0.8;">
          <Icon path={mdiPrinter} size="1.2em" class="mr-2" />
          Imprimer
        </Button>
      </a>

      <Menu>
        <div slot="activator">
          <Button text size="small" style="opacity: .8;">
            <IconLink icon={faDownload} size="1.1em" class="mr-2" />
            Télécharger
          </Button>
        </div>
        <List dense>
          <ListItem on:click={() => downloadCSV.proposed(subscribeId)}>
            Propositions
          </ListItem>
          <ListItem on:click={() => downloadCSV.purchases(subscribeId)}>
            Achats
          </ListItem>
          <ListItem on:click={() => downloadCSV.payments(subscribeId)}>
            Payments
          </ListItem>
        </List>
      </Menu>

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
      <ArticleProvidedTable {modeAdmin} {subscribeId} on:openTarifDialog />

      <div slot="head">
        <!-- Provide button -->

        {#if !modeAdmin}
          <ArticleEditDialog {subscribeId} disabled={createArticleDisabled} />
        {/if}

        <TarifInfoDialog tarif={$queryResum.data?.tarif} {modeAdmin} />
      </div>
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
