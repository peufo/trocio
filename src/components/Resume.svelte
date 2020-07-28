<script>
	import { slide } from 'svelte/transition'
	import { onMount, onDestroy } from 'svelte'
	import { flip } from 'svelte/animate'

	import Dialog, {Title, Content} from '@smui/dialog'
	import Button from '@smui/button'
	import Menu from '@smui/menu'
	import Textfield from '@smui/textfield'
	import List, { Item, Text } from '@smui/list'
	import Table, { Head, Body, Row, Cell } from '@smui/data-table'
	import Notify from './Notify.svelte'
	import SearchTable from './SearchTable.svelte'
	import ArticleDialog from './ArticleDialog.svelte'

	import { trocDetails as details, trocDetailsPromise as detailsPromise } from './stores'
	//import { getHeader, getFee, getMargin, sortByUpdatedAt, goPrint, formatPrice } from './utils'
	import { getHeader, sortByUpdatedAt, formatPrice, getFields, addStatutField, statutFiltersOptions, sortOptions } from './utils'
	import { getFee, getMargin } from '../../api/controllers/troc_utils'
	import AutoPatch from './AutoPatch.svelte'
	import Article from './Article.svelte'
	import Logo from './Logo.svelte'
	import DetailCard from './DetailCard.svelte'

	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
	dayjs.extend(relativeTime)

    const LIMIT_LIST_INIT = 10 //Nombre d'élément d'une liste afficher initialement
    const LIMIT_LIST_INIT_SOLD = 50 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste (Achat)
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste (Paiement)
    let LIMIT_LIST_C = LIMIT_LIST_INIT_SOLD //Nombre d'élément afficher pour la seconde liste (Vente)

	
	//Requested values
	export let userId = false
	export let troc = false

	$: console.log({userId})
	$: console.log({troc})
	$: console.log({$details})

	let providedFields = getFields('# Désignation Statut Frais Marge Prix', '')

	let articleDialog
	let article = {} //Article selected

	let modifiedArticles = []			//Array for minimize PATCH request on AutoPatch.svelte
	let clearModifiedArticles			//Timeout

	let createArticlePromise
	let createImportArticlesPromise
	let deleteArticlePromise
	let articleWaitValidationForDelete = -1

	let importArticlesListOpen = false 	//Modal popup for import list of articles
	let importArticlesValue = '' 		//Value of textarea
	let importArticles = [] 			//Array formated
	let failFormatRaison = ''			//Message if importArticlesValue is unavailable

	let tarifInfoDialog
	let createArticleDialog
	let newArticleName = ''
	let newArticlePrice = ''

	let onPrint = false

	let statutFilterMenu
	let statutFilter = -1

	let notify //Bind to notify component


	//For AutoPatch
	function addModifiedArticle(e, art) {

		let index = -1

		//update price value and compute fee and margin
		if (e.target.classList.contains('price-input') && !isNaN(e.target.value)) {
			art.price = e.target.value
			index = $details.provided.map(a => a._id).indexOf(art._id)
			$details.provided[index].fee = getFee(art, $details.tarif)
			$details.provided[index].margin = getMargin(art, $details.tarif)
		}

		index = modifiedArticles.map(a => a._id).indexOf(art._id)
		if (index == -1) {
			modifiedArticles = [...modifiedArticles, art]
		}else{
			modifiedArticles[index] = art
		}
		clearTimeout(clearModifiedArticles)
		clearModifiedArticles = setTimeout(() => modifiedArticles = [], 700)
	}

	async function createArticle() {

		if ($details.tarif && $details.provided.length + 1 > $details.tarif.maxarticles) {
			alert(`Désolé, vous avez proposé trop d'article`)
			tarifInfoDialog.open()
			return
		}

		let res = await fetch('/articles', getHeader({troc: troc._id, provider: userId, name: newArticleName, price: newArticlePrice}))
		let json = await res.json()
		if (json.success) {
			
			$details.provided = [...$details.provided, json.message[0]]
			//Reset le formulair mais reste descue 
			newArticleName = ''
			newArticlePrice = ''
			document.getElementById(`newArticleName`).focus()

			notify.notify('Article ajouté', 'fas fa-check')

			return
			
		}else alert(json.message)
		
	}

	async function createImportArticles() {

		if ($details.tarif && $details.provided.length + importArticles.length > $details.tarif.maxarticles) {
			alert(`Désolé, vous avez proposé trop d'article`)
			tarifInfoDialog.open()
			return
		}

		//TODO: Calcul fee... Bad idea on frontside ???
		importArticles.forEach(art => art.fee = getFee(art, $details.tarif))

		let res = await fetch('/articles', getHeader(importArticles))
		let json = await res.json()
		if (json.success) {
			
			$details.provided = [...$details.provided, ...json.message]
			//Hide importe articles input
			importArticlesListOpen = false
			importArticlesValue = ''
			importArticles = []

			return

		}else alert(json.message)

	}

	async function deleteArticle(artId) {
		let res = await fetch(`/articles/${artId}`, getHeader({}, 'DELETE'))
		let json = await res.json()
		if (json.success) {
			let index = $details.provided.map(art => art._id).indexOf(artId)
			if (index == -1) return alert('Index not found')
			$details.provided.splice(index, 1)
			$details.provided = $details.provided

			notify.notify('Article supprimé', 'far fa-trash-alt')

			return
		}else alert(json.message)
	}
	
	let status = ['Proposé', 'En vente', 'Vendu', 'Récupéré']
	function getStatus(art) {
		if (!art.valided) return 0
		if (art.sold) return 2
		if (art.recover) return 3
		return 1
	}

	function inputImportArticles() {

		importArticles = []
		failFormatRaison = ''

		//Input Value parser
		if (importArticlesValue.trim().length) {
			let lines = importArticlesValue.split(/[\r\n]/)
			let cells = []
			let price = 0

			if (!$details.traderPrefix) {// utilsateur simple
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
							troc: troc._id,
							provider: userId
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
						
						if (isNaN(cells[0].replace($details.traderPrefix, '')) || cells[0].indexOf('.') != -1) failFormatRaison = `Vous devez mettre un nombre après le préfixe !`
						if (cells[0].trim()[0] != $details.traderPrefix) failFormatRaison = `Vous devez utilier un "${$details.traderPrefix}" comme préfixe !`

						importArticles = [...importArticles, {
							ref: cells[0].trim(),
							name: cells[1].trim(),
							price,
							troc: troc._id,
							provider: userId
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

	function clickDownladCSV() {

		let list = $details.provided.map(p => {
			return {
				ref: p.ref,
				name: p.name,
				statuts: status[getStatus(p)],
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

	function print() {
		LIMIT_LIST_A = $details.purchases.length
		LIMIT_LIST_B = $details.payments.length
		LIMIT_LIST_C = $details.provided.length
		onPrint = true
		//TODO: repair print
		//setTimeout(() => goPrint('resume-container'), 300)
		setTimeout(() => {onPrint = false; LIMIT_LIST_C = 50}, 400)
	}

	function selectArticle(e) {
        article = e.detail
        setTimeout(articleDialog.open, 0)
	}
	
	function articlePatched(e) {
        let index = $details.provided.map(art => art._id).indexOf(e.detail._id)
        $details.provided[index] = addStatutField([e.detail])[0]
    }

</script>

<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/json2csv/4.5.3/json2csv.umd.min.js"></script>
</svelte:head>

<Notify bind:this={notify}/>

<Dialog bind:this={createArticleDialog}>
	<Title>Proposer un article</Title>
	<Content>
		<textarea id="newArticleName" cols="30" rows="3" placeholder="Désignation" bind:value={newArticleName}></textarea>
		<input placeholder="Prix" style="width: 50%; height: 36px;" bind:value={newArticlePrice} on:input={formatPrice} />
		<!--
		TODO: TextField failed
			<Textfield on:input={console.log}/>
		-->
		{#await createArticlePromise}
			<Button color="secondary" variant="outlined" class="w3-right">
				<i class="fas fa-circle-notch w3-spin"></i>&nbsp;Création de l'article ...
			</Button>
		{:then}
			<Button variant="outlined" class="w3-right" on:click={() => createArticlePromise = createArticle()}>
				Valider
			</Button>
		{/await}
	</Content>
</Dialog>

{#await $detailsPromise}
	<div style="position: relative; height: 500px">
		<Logo/>
	</div>
{:then}
<div id="resume-container" style="max-width: 700px; margin: auto;">

	<br>
	<div class="w3-row w3-xlarge" style="padding-left: 7px;">
		<div class="w3-col s1">&nbsp;</div>
		<span class="w3-col s9">Solde actuel </span>
		<span id="balance" class="w3-col s2 w3-right-align">{$details.balance.toFixed(2)}</span>
	</div>
	
	<br><br>
	<DetailCard title="Paiements"
	count={$details.payments.length}
	sum={$details.paySum}
	nonInteractive
	items={$details.payments}
	let:item={payment}>
		<span slot="col-1"></span>
		<span slot="col-2">{payment.message} {dayjs(payment.createdAt).fromNow()}</span>
		<span slot="col-3">{payment.amount.toFixed(2)}</span>						
	</DetailCard>

	<br>
	<DetailCard title="Achats"
	count={$details.purchasesCount}
	sum={$details.buySum}
	items={$details.purchases}
	let:item={article}>
		<span slot="col-1">#{article.ref}</span>
		<span slot="col-2">{article.name}</span>
		<span slot="col-3">{article.price.toFixed(2)}</span>
	</DetailCard>

	<br>
	<DetailCard title="Ventes"
	free
	count={$details.providedCount}
	sum={$details.soldSum + $details.feeSum}>
		
		
		<SearchTable
			troc={troc._id}
			fields={providedFields}
			items={$details.provided}
			on:select={selectArticle}
			showAllFields preloaded
			baseURL={`/articles?provider=${userId}&include_without_name=true&`}/>
		
		<ArticleDialog article={article} bind:dialog={articleDialog} on:patched={articlePatched}/>
		
		<!--
		<Table style="width: 100%; border: none;">
			<Head>
				<Row>
					<Cell>#</Cell>
					<Cell>Désignation</Cell>
					<Cell>Status</Cell>
					<Cell>Frais</Cell>
					<Cell>Prix</Cell>
				</Row>
			</Head>
			<Body>
				{#each $details.provided as article}
					<Row>
						<Cell>{article.ref}</Cell>
						<Cell>{article.name}</Cell>
						<Cell>{article.statut}</Cell>
						<Cell>{(article.fee + article.margin).toFixed(2)}</Cell>
						<Cell>{article.price}</Cell>
					</Row>
				{/each}
			</Body>
		</Table>
		-->
	</DetailCard>

	<br>
	<div on:click={print} class="w3-opacity w3-small underline-div w3-right" class:w3-hide={onPrint}>
		<i class="fa fa-print"></i>
		<span class="underline-span">imprimer</span>
	</div>

	<br><br><br><hr>




			<!-- Titre, Boutons propositions et somme -->
			<div class="">
				<span class="w3-right w3-large">{($details.soldSum + $details.feeSum).toFixed(2)}</span>
				<h4>Ventes</h4>

				<!-- Provide button -->
				<span class:w3-hide={onPrint}>

					{#if $details.provided.length}
						<Button
						on:click={clickDownladCSV}
						color="secondary">
							<i class="fas fa-download"></i>
						</Button>
					{/if}

					<!-- Bontons pour proposer des articles -->
					{#await createArticlePromise}
						<Button color="secondary" variant="outlined">
							<i class="fas fa-circle-notch w3-spin"></i>&nbsp;Création de l'article ...
						</Button>
					{:then}
						{#if !importArticlesListOpen}
							<!--
								<Button
								on:click="{() => createArticlePromise = createArticle()}"
								variant="outlined">
									Proposer un article
								</Button>
							-->
								<Button
								on:click="{() => createArticleDialog.open()}"
								variant="outlined">
									Proposer un article
								</Button>
						{/if}
					{/await}
				
					{#if !importArticlesListOpen}
						<Button on:click="{() => importArticlesListOpen = true}" variant="outlined">
							<i class="fas fa-list"></i>
						</Button>
					{:else if !importArticles.length}
						<Button on:click="{() => importArticlesListOpen = false}" variant="outlined" color="secondary">
							{failFormatRaison.length ? failFormatRaison : `Annuler la proposition`}
						</Button>
					{:else}
						{#await createImportArticlesPromise}
							<Button variant="outlined" color="secondary">
								<i class="fas fa-circle-notch w3-spin"></i>&nbsp;Création des articles ...
							</Button>
						{:then}
							<Button on:click="{() => createImportArticlesPromise = createImportArticles()}" variant="raised" style="color: white;">
								Valider la proposition des {importArticles.length} articles
							</Button>
						{/await}
					{/if}

				</span>

			</div>
			
			<!-- Insertion de plusieurs d'article -->
			{#if importArticlesListOpen}
				<div class="w3-row w3-margin-top" transition:slide|local>
					<textarea class="w3-round" rows="10" 
							bind:value={importArticlesValue} on:input={inputImportArticles}
							placeholder={`\n\t-- Glissez ou copiez une liste depuis un tableur --\n\t-- ${$details.traderPrefix ? '[ Référence ] ' : ''}[ Désignation ] [ Prix ] --\n\n\n${$details.traderPrefix ? `${$details.traderPrefix}1 ⭢ ` : ''} Mon premier article ⭢ 20\n${$details.traderPrefix ? `${$details.traderPrefix}2 : ` : ''} Mon deuxième article : 15.35\n${$details.traderPrefix ? `${$details.traderPrefix}3 ; ` : ''} Mon troisième article ; 5,40\n ...`}></textarea>
				</div>
			{/if}

			{#if $details.provided.length}
			<AutoPatch source="{`tableArticles${troc._id}`}" path="/articles" body={modifiedArticles} />	
			<table id="{`tableArticles${troc._id}`}" class="w3-table w3-bordered w3-margin-top">

				<!-- En-têtes -->
				<tr>
					<th>
						<span>#</span>
					</th>

					<th>
						<span>Articles</span>
					</th>

					<!-- 0=Proposé, 1=En vente, 2=Vendu, 3=Récupéré -->
					<th class="clickable" on:click={() => statutFilterMenu.setOpen(true)}>
						<span>Statuts</span><br>
						<span class="w3-tiny w3-opacity">
							<i class="fas fa-filter"></i>
							{statutFilter === -1 ? 'Tous' : status[statutFilter]}
						</span>
						<Menu bind:this={statutFilterMenu}>
							<List>
								<Item on:click={() => statutFilter = -1 }><Text>Tous</Text></Item>
								<Item on:click={() => statutFilter = 0 }><Text>Proposé</Text></Item>
								<Item on:click={() => statutFilter = 1 }><Text>En vente</Text></Item>
								<Item on:click={() => statutFilter = 2 }><Text>Vendu</Text></Item>
								<Item on:click={() => statutFilter = 3 }><Text>Récupéré</Text></Item>
							</List>
						</Menu>
					</th>
					
					<th>
						<span>Prix</span><br>
						<span class="w3-small sold">{$details.soldSum.toFixed(2)}</span>
					</th>

					<th class="clickable" on:click="{() => tarifInfoDialog.open()}">
						<span>Frais</span><br>
						<span class="w3-small fee">{-$details.feeSum.toFixed(2)}</span>
					</th>

					<th></th><!--remove-->

				</tr>

				<!-- Corp -->
				{#each $details.provided.filter(art => statutFilter === -1 || statutFilter === getStatus(art)).sort(sortByUpdatedAt).slice(0, LIMIT_LIST_C) as article, i}

					<tr>
						
						<!-- Ref # -->
						<td>
							<b class="w3-small">
								{!article.isCreated ? article.ref : ''}
							</b>						
						</td>


						<!-- Designation -->
						<td class:tdInput={!article.valided} style="width: 50%; min-width: 170px;">
							{#if article.valided}
								<span class:recovered={article.recover}>
									{article.name}
								</span>
							{:else}
								<textarea
								rows="3" style="resize: none;"
								on:input="{e =>  addModifiedArticle(e, article)}"
								class:lastInputName="{i == $details.provided.length-1}"  
								bind:value={article.name}
								type="text" 
								class="w3-input unvalided" 
								placeholder="Désignation"></textarea>
							{/if}

						</td>

						<!-- Status -->
						<td>{status[getStatus(article)]}</td>

						<!-- Prix -->
						<td class="price" class:tdInput={!article.valided} style="max-width: 100px;">
							{#if article.valided}
								<span class:recovered={article.recover} class:sold={article.sold}>
									{Number(article.price).toFixed(2)}
								</span>
							{:else}
								<input
								bind:value={article.price}
								on:input="{e => {formatPrice(e); addModifiedArticle(e, article)}}"
								type="text"
								class="price-input w3-input unvalided">
							{/if}
						</td>

						<!-- Frais -->
						<td class:w3-opacity={!article.valided} class="fee" class:unvalided={!article.valided} on:click="{() => tarifInfoDialog.open()}">
							{article.fee.toFixed(2)}
							{@html article.sold ? ` <span class="w3-tiny">+</span> ${article.margin.toFixed(2)}` : ''}
						</td>

						<!-- Suppression (uniquement les articles non validé) -->
						<td on:mouseleave="{() => articleWaitValidationForDelete = -1}" class="removeCell">
							{#if !article.valided}
								{#if articleWaitValidationForDelete == article._id}
									{#await deleteArticlePromise}
										<span class="w3-padding">
											<i class="fa fa-times w3-spin"></i>
										</span>
									{:then}
										<span class="w3-padding w3-round clickable" on:click="{() => deleteArticlePromise = deleteArticle(article._id)}" style="background: rgba(255, 0, 0, .2);">
											<i class="fa fa-times"></i>
										</span>
									{/await}
								{:else}
									<span class="w3-padding clickable" on:click="{() => articleWaitValidationForDelete = article._id}">
										<i class="fa fa-times"></i>
									</span>
								{/if}
							{/if}
						</td>
					</tr>

				{/each}
			</table>
			{:else}
				<br>
				<span class="w3-opacity">Pas d'article proposé</span>
			{/if}
			
			<br>

			<!-- Bouton pour prolongé la liste -->
			<!-- TODO: reparer
				{#if $details.provided.filter(art => statutFilter === -1 || statutFilter === getStatus(art)).length > LIMIT_LIST_C}
					<div on:click="{() => LIMIT_LIST_C += 50}" class="underline-div w3-center">
						<span class="underline-span w3-opacity">
							Afficher plus de résultat ({$details.provided.filter(art => statutFilter === -1 || statutFilter === getStatus(art)).length - LIMIT_LIST_C})
						</span>
					</div>
				{/if}

			-->

			<br>

	<br>
	
</div>

<!-- Dialogue d'information sur les tarifs -->
{#if $details.tarif}
	<Dialog bind:this={tarifInfoDialog}>
		<Title>Vous êtes soumis au tarif <b>{$details.tarif.name}</b>: </Title>
		<Content>
			<h5>Nombre maximum d'article proposés</h5><br>
			<div style="text-align: center;">
				<b>{$details.tarif.maxarticles}</b> <i class="fas fa-cube"></i>
			</div>
			<br><br>

			<h5>Frais de traitement
				<span class="w3-small w3-opacity">Appliqué au dépot de l'article</span>
			</h5><br>
			<div style="text-align: center;">
				{#each $details.tarif.fee.sort((a, b) => a.price - b.price) as fee}
					A partir de <b>{fee.price.toFixed(2)} </b><i class="fas fa-arrow-right"></i> <b>{fee.value.toFixed(2)}</b>
					<br>
				{/each}
			</div>
			<br><br>

			<h5>Marge
				<span class="w3-small w3-opacity">Appliquée à la vente de l'article</span>
			</h5><br>
			<div style="text-align: center;">
				<b>{$details.tarif.margin * 100}</b> <i class="fas fa-percent"></i>
			</div>
			<br>
			
		</Content>
	</Dialog>
{/if}

{:catch err}
	<h1>Error {err}</h1>

{/await}


<style>
	#resume-container {
		position: relative;
	}

	.removeCell {
		position: absolute;
    	right: 0px;
	}

	.fa-times {
		transform: scale(0);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	td {
		min-height: 61px;
	}

	tr:hover .fa-times {
		transform: scale(1);
	}
	tr:hover .fa-times:hover {
		color: red;
		transform: scale(1.2);
	}
	.tdInput {
		padding: 0px;
	}
	.w3-input {
		border: none;
	}

	.fee:not(.unvalided) {
		color: red;
	}

	.unvalided {
		opacity: .5;
	}
	.recovered {
		text-decoration: line-through;
	}
	.sold {
		color: green;
	}

</style>