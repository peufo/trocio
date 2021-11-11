<script lang="ts">
  import { fade } from 'svelte/transition'
  import { Button } from 'svelte-materialify'
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
        data: { userSubId: subscribeId, amount: -(resum?.balance || 0) },
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

  function print() {
    console.log('TODO, server endpoint provid resum.pdf')
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
      <div class="flex-grow-1" />
      {#if modeAdmin && resum.balance !== 0}
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
          <Button
            text
            dense
            on:click={clickOpenCreateArticle}
            disabled={isClosed}
          >
            <IconLink icon={faPlus} opacity size="1.1em" class="mr-2" />
            article
          </Button>

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

      <ArticleProvidedTable modeAdmin {subscribeId} on:openTarifDialog />
    </DetailCard>

    <br />

    <DetailCard
      title="Achats"
      free
      count={resum.purchasesCount || 0}
      sum={-(resum.purchasesSum || 0)}
    >
      {#each resum.purchases || [] as article}
        <div class="d-flex">
          <div>#{article.ref}</div>
          <div class="flex-grow-1">{article.name}</div>
          <div>{renderAmount(article.price)}</div>
        </div>
      {:else}
        <div class="text-center pa-12 text--secondary">Aucun achat</div>
      {/each}
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
      {#each resum.payments || [] as payment}
        <div class="d-flex">
          <div>{new Date(payment.createdAt).toLocaleString()}</div>
          <div class="flex-grow-1">{payment.message}</div>
          <div>{renderAmount(payment.amount)}</div>
        </div>
      {:else}
        <div class="text-center pa-12 text--secondary">Aucun paiement</div>
      {/each}
    </DetailCard><br />

    <!--
      <div on:click={print} class="w3-opacity w3-small underline-div w3-right">
        <i class="fa fa-print" />
        <span class="underline-span">imprimer</span>
      </div>
    -->
    <br />
  </div>
{/if}
