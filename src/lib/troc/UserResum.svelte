<script lang="ts">
  import { fade } from 'svelte/transition'
  import { Button } from 'svelte-materialify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import { faFileDownload, faPlus } from '@fortawesome/free-solid-svg-icons'
  import 'dayjs/locale/fr'

  import ArticleProvidedTable from '$lib/article/ProvidedTable.svelte'
  import ArticleCreateDialog from '$lib/article/CreateDialog.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import DetailCard from '$lib/util/DetailCard.svelte'

  import IconLink from '$lib/util/IconLink.svelte'
  import { useApi } from '$lib/api'
  import type { SubscribeResum } from 'types'

  export let trocId = ''
  export let userId = ''

  $: queryResum = useApi<{ trocId: string; userId: string }, SubscribeResum>([
    '/subscribes/resum',
    { trocId, userId },
  ])
  $: resum = $queryResum.data

  let articleCreateDialogActive = false

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  //Création d'article (buttons)
  let importArticlesListOpen = false //Modal popup for import list of articles
  let paymentShow = false

  let providedShow = false

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
</script>

<ArticleCreateDialog {trocId} bind:dialogActive={articleCreateDialogActive} />

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
    <div class="w3-row w3-xlarge" style="padding-left: 7px;">
      <div class="w3-col s1">&nbsp;</div>
      <span class="w3-col s8">Solde actuel </span>
      <span id="balance" class="w3-col s3 w3-right-align">
        {resum.balance.toFixed(2)}
      </span>
    </div>
    <br /><br />
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
          {#if !importArticlesListOpen}
            <Button text dense on:click={clickOpenCreateArticle}>
              <IconLink icon={faPlus} opacity size="1.1em" class="mr-2" />
              article
            </Button>
          {/if}

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
