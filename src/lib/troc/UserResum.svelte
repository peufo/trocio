<script lang="ts">
  import { fade } from 'svelte/transition'
  import { Button, Icon, Table } from 'svelte-materialify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { faPlus } from '@fortawesome/free-solid-svg-icons'
  import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons'
  import 'dayjs/locale/fr'

  import { renderAmount } from '$lib/utils'
  import ArticleProvidedTable from '$lib/article/ProvidedTable.svelte'
  import ArticleCreateDialog from '$lib/article/CreateDialog.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import TarifInfoDialog from '$lib/troc/TarifInfoDialog.svelte'
  import DetailCard from '$lib/util/DetailCard.svelte'
  import IconLink from '$lib/util/IconLink.svelte'
  import { api, useApi } from '$lib/api'
  import type { PaymentCreate, SubscribeResum } from 'types'
  import { useMutation, useQueryClient } from '@sveltestack/svelte-query'
  import { mdiPrinter } from '@mdi/js'

  export let subscribeId: string
  export let isClosed = false
  /** Affiche le bouton du reglement du sold et les fonctions d'anulation d'évenement sur les articles*/
  export let modeAdmin = false

  let articleCreateDialogActive = false
  let tarifInfoDialogActive = false
  let providedShow = false
  let paymentShow = false
  const queryClient = useQueryClient()

  $: queryResum = useApi<{ subscribeId: string }, SubscribeResum>([
    'subscribes/resum',
    { subscribeId },
  ])
  $: resum = $queryResum.data?.resum

  const queryPayment = useMutation(
    () =>
      api<PaymentCreate>('/api/payments', {
        method: 'post',
        data: {
          userSubId: subscribeId,
          amount: -(resum?.balance || 0),
          message: 'Règlement du solde',
        },
        success: 'Solde reglé avec succès',
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('subscribes/resum')
      },
    }
  )

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  async function printResum() {
    const winPrint = window.open(
      `/print-subscribe?subscribeId=${subscribeId}`,
      '',
      'width=1000,height=800,location=no'
    )
    if (winPrint) {
      winPrint.onload = () => {
        setTimeout(() => winPrint.close(), 3000)
      }
    }
  }

  function clickDownladCSV() {
    console.log('TODO, server endpoint provid resum.csv')
  }

  function clickOpenCreateArticle() {
    providedShow = true
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
  <div in:fade|local class="centered" style="height: 160px;">
    <Loader />
  </div>
{:else if $queryResum.isError}
  <div in:fade|local class="centered" style="height: 160px;">
    Oups, une erreur est survenu.
  </div>
{:else if $queryResum.isSuccess && resum}
  <div in:fade|local>
    <br />
    <div class="d-flex">
      <!--
        <a href={`/print-subscribe?subscribeId=${subscribeId}`} target="_blank">
          <Button text size="small" style="opacity: 0.6;" class="mt-4">
            <Icon path={mdiPrinter} size="1.1em" class="mr-2" />
            Imprimer
          </Button>
        </a>
      -->
      <Button
        text
        size="small"
        style="opacity: 0.6;"
        class="mt-4"
        on:click={printResum}
      >
        <Icon path={mdiPrinter} size="1.1em" class="mr-2" />
        Imprimer
      </Button>

      <div class="flex-grow-1" />
      <!-- Patch en attendant de gerer la monaie correctement dans la DB -->
      {#if modeAdmin && Math.abs(resum.balance) > 0.001}
        <Button
          class="primary-color mt-2 mr-4"
          on:click={() => $queryPayment.mutate()}
          disabled={$queryPayment.isLoading}
        >
          Regler le solde en {resum.balance > 0
            ? 'faveur du client'
            : 'votre faveur'}
        </Button>
        <h6>{renderAmount(resum.balance)}</h6>
      {:else}
        <h6 class="mr-1">
          Solde &nbsp;&nbsp;
          {renderAmount(resum.balance)}
        </h6>
      {/if}
    </div>

    <br />
    <DetailCard
      title="Ventes"
      free
      bind:show={providedShow}
      count={resum.providedCount || 0}
      sum={(resum.soldSum || 0) - (resum.feeSum || 0) - (resum.marginSum || 0)}
    >
      <span slot="head">
        <!-- Provide button -->
        <span style="margin-left: 30px;">
          <!-- Bonton pour proposer un articles -->
          {#if !modeAdmin}
            <Button
              text
              dense
              on:click={clickOpenCreateArticle}
              disabled={isClosed}
            >
              <IconLink icon={faPlus} opacity size="1.1em" class="mr-2" />
              article
            </Button>
          {/if}

          <!-- Bonton pour proposer un articles -->
          <Button text dense on:click={clickOpenTarifInfo}>
            <IconLink
              icon={faQuestionCircle}
              opacity
              size="1.1em"
              class="mr-2"
            />
            Tarif
          </Button>

          <!-- Bonton pour télécharger le fichier .csv -->
          <!--
            {#if resum.providedCount}
              <IconLink
                clickable
                icon={faFileDownload}
                on:click={clickDownladCSV}
                opacity
                size=".7em"
                tip="Télécharger les données"
              />
            {/if}
          -->
        </span>
      </span>

      <ArticleProvidedTable {modeAdmin} {subscribeId} on:openTarifDialog />
    </DetailCard>

    <br />

    <DetailCard
      title="Achats"
      free
      count={resum.purchasesCount || 0}
      sum={-(resum.purchasesSum || 0)}
    >
      <Table class="pb-2">
        <thead>
          <tr>
            <th>Référence</th>
            <th>Nom</th>
            <th>Date de l'achat</th>
            <th>Prix</th>
          </tr>
        </thead>
        <tbody>
          {#each resum.purchases || [] as article}
            <tr>
              <td>{article.ref}</td>
              <td>{article.name}</td>
              <td>{new Date(article.sold || '').toLocaleString()}</td>
              <td align="right">{renderAmount(article.price)}</td>
            </tr>
          {/each}
        </tbody>
      </Table>

      {#if !resum.purchases?.length}
        <div class="text-center pa-12 text--secondary">Aucun achat</div>
      {/if}
    </DetailCard>

    <br />

    <DetailCard
      title="Paiements"
      count={resum.paymentsCount || 0}
      sum={resum.paymentsSum || 0}
      nonInteractive
      free
      show={paymentShow}
    >
      <Table>
        <thead>
          <tr>
            <th>Date du paiement</th>
            <th>Commentaire</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          {#each resum.payments || [] as payment}
            <tr>
              <td>{new Date(payment.createdAt).toLocaleString()}</td>
              <td>{payment.message || '-'}</td>
              <td align="right">{renderAmount(payment.amount)}</td>
            </tr>
          {/each}
        </tbody>
      </Table>
      {#if !resum?.payments?.length}
        <div class="text-center pa-12 text--secondary">Aucun paiement</div>
      {/if}
    </DetailCard>

    <br />
    <br />
  </div>
{/if}
