<script lang="ts">
  import { fade } from 'svelte/transition'
  import { Button } from 'svelte-materialify'
  import dayjs from 'dayjs'
  import relativeTime from 'dayjs/plugin/relativeTime'
  import 'dayjs/locale/fr'

  import { useTrocUserResum, useTrocUserResumOptions } from '$lib/troc/store'
  import { addStatutField, getHeader, sortByUpdatedAt } from '$lib/utils'
  import ArticleProvidedTable from '$lib/article/ProvidedTable.svelte'
  import ArticleCreateDialog from '$lib/article/CreateDialog.svelte'
  import Loader from '$lib/util/Loader.svelte'
  import DetailCard from '$lib/util/DetailCard.svelte'

  import IconLink from '$lib/util/IconLink.svelte'
  import { faFileDownload, faPlus } from '@fortawesome/free-solid-svg-icons'

  export let trocId = ''
  export let userId = ''

  const queryTrocUserResum = useTrocUserResum(trocId, userId)
  $: queryTrocUserResum.setOptions(useTrocUserResumOptions(trocId, userId))
  $: trocUserResum = $queryTrocUserResum.data
  $: console.log({ useTrocUserResum })

  let articleCreateDialogActive = false

  dayjs.locale('fr')
  dayjs.extend(relativeTime)

  let onPrint = false

  //Création d'article (buttons)
  let importArticlesListOpen = false //Modal popup for import list of articles
  let paymentShow = false

  //For print ... not used now
  let buyShow = false
  let providedShow = false

  function print() {
    console.log('TODO, repair Create PDF ?')
    /*
		let paymentShowSave = paymentShow
		let buyShowSave = buyShow
		let providedShowSave = providedShow
		paymentShow = true
		buyShow = true
		onPrint = true

		//TODO: repair print
		//setTimeout(() => goPrint('resume-container'), 300)
		setTimeout(() => {
			paymentShow = paymentShowSave
			buyShow = buyShowSave
			providedShow = providedShowSave
			onPrint = false
		}, 400)
		*/
  }

  function clickDownladCSV(e) {
    e.stopPropagation()
    // TODO: déplacé vers le serveur
    console.log('TODO', 'déplacé vers le serveur')
    let list = trocUserResum.provided.map((p) => {
      return {
        ref: p.ref,
        name: p.name,
        statut: p.statut,
        price: Number(p.price).toFixed(2),
        fee: p.fee.toFixed(2),
        margin: p.margin.toFixed(2),
        createdAt: p.createdAt.replace('T', ' ').replace('Z', ''),
        updatedAt: p.updatedAt.replace('T', ' ').replace('Z', ''),
      }
    })

    const fields = [
      'ref',
      'name',
      'statuts',
      'price',
      'fee',
      'margin',
      'createdAt',
      'updatedAt',
    ]

    let csv = [
      fields.join('\t'),
      ...list.map((row) => {
        fields.map((field) => row[field]).join('\t')
      }),
    ].join('\n')

    downloadCSV('Export Trocio.txt', csv)
  }

  function downloadCSV(filename, text) {
    var element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(text)
    )
    element.setAttribute('download', filename)
    element.style.display = 'none'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  function clickOpenCreateArticle(e) {
    providedShow = true
    articleCreateDialogActive = true
  }
</script>

<ArticleCreateDialog {trocId} bind:dialogActive={articleCreateDialogActive} />

{#if $queryTrocUserResum.isLoading}
  <div in:fade|local class="centered mt-10">
    <Loader />
  </div>
{:else if $queryTrocUserResum.isError}
  <div in:fade|local class="centered mt-10">Oups, une erreur est survenu.</div>
{:else if $queryTrocUserResum.isSuccess}
  <div in:fade|local>
    <br />
    <div class="w3-row w3-xlarge" style="padding-left: 7px;">
      <div class="w3-col s1">&nbsp;</div>
      <span class="w3-col s8">Solde actuel </span>
      <span id="balance" class="w3-col s3 w3-right-align">
        {trocUserResum.balance.toFixed(2)}
      </span>
    </div>
    <br /><br />

    <DetailCard
      title="Paiements"
      count={trocUserResum.paymentsCount}
      sum={trocUserResum.paymentsSum}
      nonInteractive
      show={paymentShow}
      items={true ? [] : trocUserResum.payments.sort(sortByUpdatedAt)}
      let:item={payment}
    >
      <span slot="col-1" />
      <span slot="col-2"
        >{payment.message} {dayjs(payment.createdAt).fromNow()}</span
      >
      <span slot="col-3">{payment.amount.toFixed(2)}</span>
    </DetailCard><br />

    <DetailCard
      title="Achats"
      count={trocUserResum.purchasesCount}
      sum={trocUserResum.purchasesSum}
      show={buyShow}
      items={true ? [] : trocUserResum.purchases.sort(sortByUpdatedAt)}
      let:item={article}
    >
      <span slot="col-1">#{article.ref}</span>
      <span slot="col-2">{article.name}</span>
      <span slot="col-3">{article.price.toFixed(2)}</span>
    </DetailCard><br />

    {#if trocUserResum.providedCount}
      <DetailCard
        title="Ventes"
        free
        bind:show={providedShow}
        count={trocUserResum.providedCount}
        sum={trocUserResum.soldSum + trocUserResum.feeSum}
      >
        <span slot="head">
          <!-- Provide button -->
          <span class:w3-hide={onPrint} style="margin-left: 30px;">
            <!-- Bonton pour proposer un articles -->
            {#if !importArticlesListOpen}
              <Button text dense on:click={clickOpenCreateArticle}>
                <IconLink icon={faPlus} opacity size="1.1em" class="mr-2" />
                article
              </Button>
            {/if}

            <!-- Bonton pour télécharger le fichier .csv -->
            {#if trocUserResum.providedCount}
              <IconLink
                clickable
                icon={faFileDownload}
                on:click={clickDownladCSV}
                opacity
                size=".7em"
                tip="Télécharger les données"
              />
            {/if}
          </span>
        </span>

        <ArticleProvidedTable {trocId} on:openTarifDialog />
      </DetailCard>
    {/if}
    <br />

    <div
      on:click={print}
      class="w3-opacity w3-small underline-div w3-right"
      class:w3-hide={onPrint}
    >
      <i class="fa fa-print" />
      <span class="underline-span">imprimer</span>
    </div>
    <br />
  </div>
{/if}
