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
  import { useApi } from '$lib/api'
  import type { SubscribeResum } from 'types'

  export let trocId = ''
  export let userId = ''

  $: queryResum = useApi<{ trocId: string; userId: string }, SubscribeResum>([
    'subscribes/resum',
    { trocId, userId },
  ])
  $: resum = $queryResum.data

  let articleCreateDialogActive = false
  let tarifInfoDialogActive = false
  let providedShow = false
  let paymentShow = false

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

<ArticleCreateDialog
  {trocId}
  bind:active={articleCreateDialogActive}
  {queryResum}
/>

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
      <h6 class="mr-1">
        Solde actuel &nbsp;&nbsp;
        {renderAmount(resum.balance)}
      </h6>
    </div>

    <br />
    <DetailCard
      title="Ventes"
      free
      bind:show={providedShow}
      count={resum.providedCount || 0}
      sum={(resum.soldSum || 0) + (resum.feeSum || 0) + (resum.marginSum || 0)}
    >
      <span slot="head">
        <!-- Provide button -->
        <span style="margin-left: 30px;">
          <!-- Bonton pour proposer un articles -->
          <Button text dense on:click={clickOpenCreateArticle}>
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
            Frais
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

      <ArticleProvidedTable {trocId} {userId} on:openTarifDialog />
    </DetailCard>

    <br />

    <DetailCard
      title="Achats"
      count={resum.purchasesCount || 0}
      sum={resum.purchasesSum || 0}
    >
      <!--

      <span slot="col-1">#{article.ref}</span>
      <span slot="col-2">{article.name}</span>
      <span slot="col-3">{article.price.toFixed(2)}</span>
    -->
    </DetailCard>

    <br />

    <DetailCard
      title="Paiements"
      count={resum.paymentsCount || 0}
      sum={resum.paymentsSum || 0}
      nonInteractive
      show={paymentShow}
    >
      <!--
      <span slot="col-1" />
      <span slot="col-2"
        >{payment.message} {dayjs(payment.createdAt).fromNow()}</span
      >
      <span slot="col-3">{payment.amount.toFixed(2)}</span>

    -->
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
