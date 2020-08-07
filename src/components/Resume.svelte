<script>
	import { createEventDispatcher } from 'svelte'
	import { slide, fade } from 'svelte/transition'

	import Dialog, {Title, Content} from '@smui/dialog'
	import Button from '@smui/button'
	

	import SearchTable from './SearchTable.svelte'
	//import ArticleDialog from './ArticleDialog.svelte'
	import ProvidedTable from './ProvidedTable.svelte'

	import notify from './notify.js'
	import { trocDetails as details, trocDetailsPromise as detailsPromise } from './stores'
	import { getFields, addStatutField, formatPrice, getHeader, sortByUpdatedAt } from './utils'
	
	import Logo from './Logo.svelte'
	import DetailCard from './DetailCard.svelte'

	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
	dayjs.extend(relativeTime)
	const dispatch = createEventDispatcher()

	let providedFields = getFields('# Désignation Statut Frais Marge Prix', '')

	let articleDialog
	let article = {} //Article selected

	let onPrint = false

	//Création d'article (buttons)
	let createImportArticlesPromise
	let importArticlesListOpen = false 	//Modal popup for import list of articles
	let importArticlesValue = '' 		//Value of textarea
	let importArticles = [] 			//Array formated
	let failFormatRaison = ''			//Message if importArticlesValue is unavailable
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

    async function createImportArticles() {

		if ($details.tarif && $details.provided.length + importArticles.length > $details.tarif.maxarticles) {
			notify.warning({
				title: `Trop d'articles`,
				text: `Vous avez atteint le nombre maximal d'articles pouvant être proposés.\nRenseignez-vous auprès de l'organisateur pour lever cette limite.`
			})
			return
		}

		try {

			let res = await fetch('/articles', getHeader(importArticles))
			let json = await res.json()
			if (json.success) {
				let articlesImported = json.message

				$details.provided = [...$details.provided, ...addStatutField(articlesImported)]
				//Hide importe articles input
				importArticlesListOpen = false
				importArticlesValue = ''
				importArticles = []

				notify.success(`${articlesImported.length} articles ajoutés`)

				return

			}else notify.error(json.message)
		} catch (error) {
			console.error(error)
		}
	}
	
	function inputImportArticles() {

		importArticles = []
		failFormatRaison = ''

		//Input Value parser
		if (importArticlesValue.trim().length) {
			let lines = importArticlesValue.split(/[\r\n]/)
			let cells = []
			let price = 0

			if (!$details.prefix) {// utilsateur simple
				lines.forEach((line, i) => {
					cells = line.split(/[\t:;]/)
					if (cells.length >= 2) {
						price = Number(cells[1].replace(/,/, '.'))
						if (isNaN(price) || !cells[0].trim().length || !cells[1].trim().length) {
							failFormatRaison = `L'article n°${i + 1} n'est pas valide !`
						}
						importArticles.push({
							name: cells[0].trim(),
							price,
							troc: $details.troc,
							provider: $details.user
						})
					}else if (line.length > 0){
						failFormatRaison = `L'article n°${i + 1} n'est pas valide !`
					}
				})
			}else{//Commerçants
				lines.forEach((line, i) => {
					cells = line.split(/[\t:;]/)
					if (cells.length >= 3) {
						price = Number(cells[2].replace(/,/, '.'))
						if (isNaN(price) || !cells[0].trim().length || !cells[1].trim().length || !cells[2].trim().length) {
							failFormatRaison = `L'article n°${i + 1} n'est pas valide !`
						}
						
						if (isNaN(cells[0].replace($details.prefix, '')) || cells[0].indexOf('.') != -1) failFormatRaison = `Vous devez mettre un nombre après le préfixe !`
						if (cells[0].trim()[0] != $details.prefix) failFormatRaison = `Vous devez utilier un "${$details.prefix}" comme préfixe !`

						importArticles = [...importArticles, {
							ref: cells[0].trim(),
							name: cells[1].trim(),
							price,
							troc: $details.troc,
							provider: $details.user
						}]
					}else if (line.length > 0){
						failFormatRaison = `L'article n°${i + 1} n'est pas valide !`
					}
				})
			}
		}
		//Reset if failed
		if (failFormatRaison.length) importArticles = []
	}

	function clickDownladCSV(e) {
		e.stopPropagation()
		let list = $details.provided.map(p => {
			return {
				ref: p.ref,
				name: p.name,
				statut: p.statut,
				price: Number(p.price).toFixed(2),
				fee: p.fee.toFixed(2),
				margin: p.margin.toFixed(2),
				createdAt: p.createdAt.replace('T', ' ').replace('Z', ''),
				updatedAt: p.updatedAt.replace('T', ' ').replace('Z', '')
			}
		})

		let { parse } = json2csv
		let options = { 
			delimiter: '\t',
			quote: '',
			withBOM: true,
			fields: ['ref', 'name', 'statuts', 'price', 'fee', 'margin', 'createdAt', 'updatedAt']
		}
		
		let csv = parse(list, options)
		downloadCSV('Export Trocio.txt', csv)
	}

	function downloadCSV(filename, text) {
		var element = document.createElement('a')
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
		element.setAttribute('download', filename)
		element.style.display = 'none'
		document.body.appendChild(element)
		element.click()
		document.body.removeChild(element)
	}

	function clickOpenCreateArticle(e) {
		providedShow = true
		dispatch('openCreateDialog')
	}

	function clickOpenImportArticle(e) {
		providedShow = true
		importArticlesListOpen = true
	}

	function closeProvidedTable(e) {
		importArticlesListOpen = false
	}
	
</script>

<svelte:head>
	<!-- JSON to CSV -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/json2csv/4.5.3/json2csv.umd.min.js"></script>
</svelte:head>


{#if $details}
<div id="resume-container" in:fade|local >

	<br>
	<div class="w3-row w3-xlarge" style="padding-left: 7px;">
		<div class="w3-col s1">&nbsp;</div>
		<span class="w3-col s8">Solde actuel </span>
		<span id="balance" class="w3-col s3 w3-right-align">{$details.balance.toFixed(2)}</span>
	</div><br><br>
	
	
	<DetailCard title="Paiements"
	count={$details.payments.length}
	sum={$details.paySum}
	nonInteractive
	show={paymentShow}
	items={$details.payments.sort(sortByUpdatedAt)}
	let:item={payment}>
		<span slot="col-1"></span>
		<span slot="col-2">{payment.message} {dayjs(payment.createdAt).fromNow()}</span>
		<span slot="col-3">{payment.amount.toFixed(2)}</span>						
	</DetailCard><br>


	<DetailCard title="Achats"
	count={$details.purchases.length}
	sum={$details.buySum}
	show={buyShow}
	items={$details.purchases.sort(sortByUpdatedAt)}
	let:item={article}>
		<span slot="col-1">#{article.ref}</span>
		<span slot="col-2">{article.name}</span>
		<span slot="col-3">{article.price.toFixed(2)}</span>
	</DetailCard><br>

	{#if $details.provided}
		<DetailCard title="Ventes"
		free
		bind:show={providedShow}
		on:close={closeProvidedTable}
		count={$details.provided.length}
		sum={$details.soldSum + $details.feeSum}>
			
			<span slot="head">
				<!-- Provide button -->
				<span class:w3-hide={onPrint} style="margin-left: 30px;">

					<!-- Bonton pour proposer un articles -->
					{#if !importArticlesListOpen}
						<Button dense
						on:click={clickOpenCreateArticle}>
							Proposer un article
						</Button>
					{/if}
					
				
					<!-- Bonton pour proposer une liste d'articles -->
					{#if !importArticlesListOpen}
						<Button on:click={clickOpenImportArticle} dense title="Proposer une liste d'articles">
							<i class="fas fa-list"></i>
						</Button>
					{:else if !importArticles.length}
						<Button on:click="{() => importArticlesListOpen = false}"  color="secondary" dense>
							{failFormatRaison.length ? failFormatRaison : `Annuler la proposition`}
						</Button>
					{:else}
						{#await createImportArticlesPromise}
							<Button  color="secondary" dense>
								<i class="fas fa-circle-notch w3-spin"></i>&nbsp;Création des articles ...
							</Button>
						{:then}
							<Button on:click="{() => createImportArticlesPromise = createImportArticles()}" variant="raised" dense style="color: white;">
								Proposer les {importArticles.length} articles
							</Button>
						{/await}
					{/if}

					<!-- Bonton pour télécharger le fichier .csv -->
					{#if $details.provided.length}
						<Button dense
						on:click={clickDownladCSV}
						title="Télécharger les données"
						color="secondary">
							<i class="fas fa-download"></i>
						</Button>
					{/if}

				</span>

			</span>
			

			<!-- Insertion de plusieurs d'article -->
			{#if importArticlesListOpen}
				<div class="w3-row w3-margin-top" transition:slide|local>
					<textarea class="w3-round" rows="10" 
							bind:value={importArticlesValue} on:input={inputImportArticles}
							placeholder={`\n\t-- Glissez ou copiez une liste depuis un tableur --\n\t-- ${$details.prefix ? '[ Référence ] ' : ''}[ Désignation ] [ Prix ] --\n\n\n${$details.prefix ? `${$details.prefix}1 ⭢ ` : ''} Mon premier article ⭢ 20\n${$details.prefix ? `${$details.prefix}2 : ` : ''} Mon deuxième article : 15.35\n${$details.prefix ? `${$details.prefix}3 ; ` : ''} Mon troisième article ; 5,40\n ...`}></textarea>
				</div>
			{/if}

			<ProvidedTable on:openTarifDialog/>

		</DetailCard>
	{/if}
	<br>
	
	<div on:click={print} class="w3-opacity w3-small underline-div w3-right" class:w3-hide={onPrint}>
		<i class="fa fa-print"></i>
		<span class="underline-span">imprimer</span>
	</div>
	<br>
	
</div>
{/if}


<style>
	#resume-container {
		position: relative;
	}

</style>