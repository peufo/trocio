<script>
	import { fade, slide, crossfade } from 'svelte/transition'
	import { onMount, onDestroy } from 'svelte'
	import { flip } from 'svelte/animate'
	import Dialog, {Title, Content} from '@smui/dialog'
	import Button from '@smui/button'
	import { getHeader, crossfadeConfig, getFee, getMargin, sortByUpdatedAt } from './utils'
	import AutoPatch from './AutoPatch.svelte'
	import Article from './Article.svelte'

	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
	dayjs.extend(relativeTime)

	const [send, receive] = crossfade(crossfadeConfig)

    const LIMIT_LIST_INIT = 3 //Nombre d'élément d'une liste afficher initialement
    const LIMIT_LIST_INIT_SOLD = 10 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste (Achat)
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste (Paiement)
    let LIMIT_LIST_C = LIMIT_LIST_INIT_SOLD //Nombre d'élément afficher pour la seconde liste (Vente)

	export let userId = false
	export let trocId = false
	export let tarif = undefined

	export let balance = 0
	export let buySum = 0
	export let paySum = 0
	export let soldSum = 0
	export let feeSum = 0

	export let provided = []
	export let purchases = []
	export let payments = []

	export let providedPromise
	export let purchasesPromise
	export let paymentsPromise

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

	onMount(() => {
		if (trocId) {
			getTarif()
			purchasesPromise = getPurchases()
			paymentsPromise = getPayments()
			if (userId) providedPromise = getProvided()
			else provided = []	
		}else{
			console.log('trocId required !')
		}
	})

	async function getProvided() {
		let res = await fetch(`/articles?provider=${userId}&troc=${trocId}`)
		let json = await res.json()
		if (res.ok) {
			provided = json
			return
		}
	}

	async function getPurchases() {
        let res = await fetch(`/articles?buyer=${userId}&troc=${trocId}`)
        let json = await res.json()
        if (res.ok) {
			purchases = addTime(json, 'sold', 'soldTime')
            return
        }
	}

	async function getPayments() {
        let res = await fetch(`/payments?user=${userId}&troc=${trocId}`)
        let json = await res.json()
        if (res.ok) {
			payments = json
            return
        }
	}

	//TODO: à transformer en function de Mappage ?
 	//Filtre et ajoute time
	function addTime(arr, keyIn, keyOut) {
		let lastTime = 0
		let out = arr.filter(elem => elem[keyIn])
		.map(elem => {
			elem[keyOut] = new Date(elem[keyIn]).getTime()
			return elem
		})
		.sort((a, b) => b[keyOut] - a[keyOut]).map(elem => {
			if (elem[keyOut] && elem[keyOut] != lastTime) {
				lastTime = elem[keyOut]
			}else{
				elem[keyOut] = 0
			}
			return elem
		})
		return out
	}

	$: console.log(provided)

	$: {//Calcul of sold
		

		//Purchases
		if (purchases.length) buySum = -purchases.map(a => a.price).reduce((acc, cur) => acc + cur)
		else buySum = 0

		//Payments
		if (payments.length) paySum = payments.map(a => a.amount).reduce((acc, cur) => acc + cur)
		else paySum = 0


		//Provide
		//TODO: Deplacer coté serveur
		if (userId && provided.length) {
			let arr = provided.filter(a => a.sold).map(a => a.price)
			soldSum = arr.length ? arr.reduce((acc, cur) => acc + cur) : 0

			arr = provided.filter(a => a.valided).map(a => a.fee)
			feeSum = arr.length ? -arr.reduce((acc, cur) => acc + cur) : 0

			arr = provided.filter(a => a.sold).map(a => a.margin)
			feeSum -= arr.length ? arr.reduce((acc, cur) => acc + cur) : 0
		}else{
			soldSum = 0
			feeSum = 0
		}

		//balance
		balance = Math.round((buySum + paySum + soldSum + feeSum) * 100) / 100
		console.log('Calcule: ', balance)

	}

	//For AutoPatch
	function addModifiedArticle(e, art) {

		let index = -1

		//update price value and compute fee and margin
		if (e.target.type == 'number' && !isNaN(e.target.value)) {
			art.price = Number(e.target.value)
			index = provided.map(a => a._id).indexOf(art._id)
			provided[index].fee = getFee(art, tarif)
			provided[index].margin = getMargin(art, tarif)
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

		if (tarif && provided.length + 1 > tarif.maxarticles) {
			alert(`Désolé, vous avez proposé trop d'article`)
			tarifInfoDialog.open()
			return
		}

		let res = await fetch('/articles', getHeader({troc: trocId, provider: userId}))
		let json = await res.json()
		if (json.success) {
			
			provided = [...provided, json.message]

			//Get focus on last add article
			setTimeout(() => {
				let table = document.getElementById(`tableArticles${trocId}`)
				//table.getElementsByClassName('lastInputName')[0].focus() //Focus on the last element
				table.getElementsByClassName('w3-input')[0].focus()	
			},100)

			return
			
		}else alert(json.message)
		
	}

	async function createImportArticles() {

		if (tarif && provided.length + importArticles.length > tarif.maxarticles) {
			alert(`Désolé, vous avez proposé trop d'article`)
			tarifInfoDialog.open()
			return
		}

		//Calcul fee... Bad idea on frontside ???
		importArticles.forEach(art => art.fee = getFee(art, tarif))

		let res = await fetch('/articles', getHeader(importArticles))
		let json = await res.json()
		if (json.success) {
			
			provided = [...provided, ...json.message]
			//Remove importe articles input
			importArticlesListOpen = false
			importArticlesValue = ''
			importArticles = []

			return

		}else alert(json.message)

	}

	async function deleteArticle(index) {
		let res = await fetch(`/articles/${provided[index]._id}`, getHeader({}, 'DELETE'))
		let json = await res.json()
		if (json.success) {
			provided.splice(index, 1)
			provided = provided
			return
		}else alert(json.message)
	}
	
	function getTarif() {
		fetch(`/trocs/${trocId}/tarif/${userId}`)
		.then(res => res.json())
		.then(json => {
			tarif = json
			console.log(tarif)
		})
	}

	let status = ['Proposé', 'En vente', 'Vendu', 'Récupéré']
	function getStatus(art) {
		if (!art.valided) return status[0]
		if (art.sold) return status[2]
		if (art.recover) return status[3]
		return status[1]
	}

	function inputImportArticles() {

		importArticles = []
		failFormatRaison = ''

		//Input Value parser
		if (importArticlesValue.trim().length) {
			let lines = importArticlesValue.split(/[\r\n]/)
			let cells = []
			let price = 0
			lines.forEach((line, i) => {
				cells = line.split(/[\t:;]/)
				if (cells.length >= 2) {
					price = Number(cells[1].replace(/,/, '.'))
					if (isNaN(price) || !cells[0].trim().length || !cells[1].trim().length) {
						failFormatRaison = `L'article n°${i + 1} n'est pas valide !`
					}

					importArticles = [...importArticles, {
						name: cells[0].trim(),
						price,
						troc: trocId,
						provider: userId
					}]

				}
			})
		}
		//Reset if failed
		if (failFormatRaison.length) importArticles = []
	}

	function clickDownladCSV() {

		let list = provided.map(p => {
			return {
				ref: p.ref,
				name: p.name,
				statuts: getStatus(p),
				price: p.price,
				fee: p.fee,
				margin: p.margin,
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


</script>

<svelte:head>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/json2csv/4.5.3/json2csv.umd.min.js"></script>
</svelte:head>


<div id="container">
	
	<div class="w3-row">
		<div class="w3-xlarge w3-center">
			<span class="w3-opacity">Solde actuel </span>
			<span>{balance.toFixed(2)}</span>
		</div>
	</div>
	<br>

	<div class="w3-row">

		<div class="w3-col s6">
			<div class="w3-margin-right">
				<span class="w3-right w3-large">{buySum.toFixed(2)}</span>
				<h4>Achats</h4>

				{#await purchasesPromise}
					<div class="w3-center"><img src="/favicon.ico" alt="Logo trocio" class="w3-spin"></div>
				{:then}
					{#each purchases.slice(0, LIMIT_LIST_A) as article (article._id)}
						<Article article={article} timeKey={'soldTime'}/>
					{:else}
						<span class="w3-opacity">Pas d'achat</span>
					{/each}

					<!-- Bouton pour prolongé la liste -->
					{#if purchases.length > LIMIT_LIST_A}
						<div on:click="{() => LIMIT_LIST_A += 25}" class="underline-div w3-center">
							<span class="underline-span w3-opacity">
								Afficher plus de résultat ({purchases.length - LIMIT_LIST_A})
							</span>
						</div>
					{/if}

				{/await}
			</div>
		</div>

		<div class="w3-col s6">
			<div class="w3-margin-left">
				<span class="w3-right w3-large">{paySum.toFixed(2)}</span>
				<h4>Paiement</h4>

				{#await paymentsPromise}
					<div class="w3-center">
						<img src="/favicon.ico" alt="Logo trocio" class="w3-spin">
					</div>
				{:then}
					{#each payments.slice(0, LIMIT_LIST_B) as payment (payment._id)}
						<div class="list-element valided w3-padding" in:receive="{{key: payment._id}}" animate:flip="{{duration: 200}}">
							{dayjs(payment.createdAt).fromNow()}
							<br>
							<b class="w3-tiny w3-right" style="line-height: 1;">{payment.amount.toFixed(2)}</b>
							<span class="w3-tiny" style="line-height: 1;">{payment.message}</span>
						</div>
					{:else}
						<span class="w3-opacity">Pas de paiement enregistré !</span>
					{/each}

					<!-- Bouton pour prolongé la liste -->
					{#if payments.length > LIMIT_LIST_B}
						<div on:click="{() => LIMIT_LIST_B += 25}" class="underline-div w3-center">
							<span class="underline-span w3-opacity">
								Afficher plus de résultat ({payments.length - LIMIT_LIST_B})
							</span>
						</div>
					{/if}
					
				{/await}
			</div>
		</div>

	</div>
	<br>
	<br>

	{#if userId}
	<div class="w3-row">


		{#await providedPromise}
			<div class="w3-center"><img src="/favicon.ico" alt="Logo trocio" class="w3-spin"></div>
		{:then}

			<!-- Titre, Boutons propositions et somme -->
			<div class="w3-row">
				<span class="w3-right w3-large">{(soldSum + feeSum).toFixed(2)}</span>
				<span class="w3-large">Ventes</span>
				{#if provided.length}
					<Button
					on:click={clickDownladCSV}
					color="secondary">
						<i class="fas fa-download"></i>
					</Button>
				{/if}

				<!-- Bontons puor proposer des articles -->
				{#await createArticlePromise}
					<Button color="secondary" variant="outlined" style="margin-left: 20px;">
						<i class="fas fa-circle-notch w3-spin"></i>&nbsp;Création de l'article ...
					</Button>
				{:then}
					<Button
					on:click="{() => createArticlePromise = createArticle()}"
					style="margin-left: 20px;"
					variant="outlined">
						Proposer un article
					</Button>
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


			</div>
			
			<!-- Insertion de plein d'article -->
			{#if importArticlesListOpen}
				<div class="w3-row w3-margin-top" transition:slide>
					<textarea class="w3-round" rows="10" 
							bind:value={importArticlesValue} on:input={inputImportArticles}
							placeholder="{'\n\t\t-- Glissez ou copiez une liste depuis un tableur --\n\t\t-- [ Désignation ] [ Prix ] --\n\n\nMon premier article ⭢ 20\nMon deuxième article : 15.35\nMon troisième article ; 5,40\n...'}"></textarea>
				</div>
			{/if}

		
			<AutoPatch source="{`tableArticles${trocId}`}" path="/articles" body={modifiedArticles} />	
			<table id="{`tableArticles${trocId}`}" class="w3-table w3-bordered w3-margin-top">
				<tr>
					<th>#</th>
					<th>Articles</th>
					<th>Statuts</th><!-- 0=Proposé, 1=Fournit, 2=Vendu, 3=Récupéré -->
					<th>Prix <span class="w3-small sold">{soldSum.toFixed(2)}</span></th>
					<th on:click="{() => tarifInfoDialog.open()}">Frais 
						<span class="w3-small fee">{feeSum.toFixed(2)}</span>
					</th>
					<th></th><!--remove-->
				</tr>
				{#each provided.sort(sortByUpdatedAt).slice(0, LIMIT_LIST_C) as article, i}

					<tr>
						
						<!-- Ref # -->
						<td>
							<b class="w3-small">
								{!article.isCreated ? article.ref : ''}
							</b>						
						</td>


						<!-- Designation -->
						<td class="tdInput">

							<textarea
								rows="3" style="resize: none; min-width: 320px;"
								on:input="{e =>  addModifiedArticle(e, article)}"
								class:lastInputName="{i == provided.length-1}"  
								bind:value={article.name}
								type="text" 
								class="w3-input" 
								readonly={article.valided}
								class:unvalided={!article.valided}
								class:recovered={article.recover}
								placeholder="Désignation"></textarea>

							
						</td>

						<!-- Status -->
						<td>{getStatus(article)}</td>

						<!-- Prix -->
						<td class="tdInput price">
							<!--
								bind:value is removed
							-->
							<input
								on:input="{e => addModifiedArticle(e, article)}"
								value={article.price}
								type="number"
								class="w3-input"
								readonly={article.valided}
								class:unvalided={!article.valided}
								class:recovered={article.recover}
								class:sold={article.sold}
								step="0.05"
								min="0">
						</td>

						<!-- Frais -->
						<td class:w3-opacity={!article.valided} class="fee" class:unvalided={!article.valided} on:click="{() => tarifInfoDialog.open()}">
							{article.fee.toFixed(2)}
							{@html article.sold ? ` <span class="w3-tiny">+</span> ${article.margin.toFixed(2)}` : ''}
						</td>

						<!-- Suppression (uniquement les articles non validé) -->
						<td on:mouseleave="{() => articleWaitValidationForDelete = -1}">
							{#if !article.valided}
								{#if articleWaitValidationForDelete == article._id}
									{#await deleteArticlePromise}
										<span class="w3-padding">
											<i class="fa fa-times w3-spin"></i>
										</span>
									{:then}
										<span class="w3-padding w3-round" on:click="{() => deleteArticlePromise = deleteArticle(i)}" style="background: rgba(255, 0, 0, .2);">
											<i class="fa fa-times"></i>
										</span>
									{/await}
								{:else}
									<span class="w3-padding" on:click="{() => articleWaitValidationForDelete = article._id}">
										<i class="fa fa-times"></i>
									</span>
								{/if}
							{/if}
						</td>
					</tr>

				{/each}
			</table>
			
			<br>

			<!-- Bouton pour prolongé la liste -->
			{#if provided.length > LIMIT_LIST_C}
				<div on:click="{() => LIMIT_LIST_C += 25}" class="underline-div w3-center">
					<span class="underline-span w3-opacity">
						Afficher plus de résultat ({provided.length - LIMIT_LIST_C})
					</span>
				</div>
			{/if}

			<br>

		{/await}
		
	</div>
	{/if}

</div>

{#if tarif}
<Dialog bind:this={tarifInfoDialog}>
	<Title>Vous êtes soumis au tarif <b>{tarif.name}</b>: </Title>
	<Content>
		<h5>Nombre maximum d'article proposés</h5>
		{tarif.maxarticles} <i class="fas fa-cube"></i>
		<br><br>

		<h5>Frais de traitement
			<span class="w3-small w3-opacity">Appliqué au dépot de l'article</span>
		</h5>
		{#each tarif.fee as fee}
			A partir de {fee.price.toFixed(2)} <i class="fas fa-arrow-right"></i> {fee.value.toFixed(2)} <br>
		{/each}
		
		<br>
		<h5>Marge
			<span class="w3-small w3-opacity">Appliquée à la vente de l'article</span>
		</h5>
		{tarif.margin * 100} <i class="fas fa-percent"></i>

	</Content>
</Dialog>
{/if}

<style>

	#container {
		position: relative;
	}

	.fa-times {
		transform: scale(0);
		cursor: pointer;
		transition: all 0.2s ease;
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

	input[type=number] {
		width: 6em;
	}
	
	.price {
		color: green;
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