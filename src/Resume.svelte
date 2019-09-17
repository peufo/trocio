<script>
	import { fade, slide } from 'svelte/transition'
	import { onMount } from 'svelte'
	import { flip } from 'svelte/animate'
	import { crossfade } from 'svelte/transition'
	import { getHeader, crossfadeConfig, getFee, getMargin } from './utils'
	import AutoPatch from './AutoPatch.svelte'
	import Article from './Article.svelte'
	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
	dayjs.extend(relativeTime)

	const [send, receive] = crossfade(crossfadeConfig)

    const LIMIT_LIST_INIT = 5 //Nombre d'élément d'une liste afficher initialement
    let LIMIT_LIST_A = LIMIT_LIST_INIT //Nombre d'élément afficher pour la premier liste
    let LIMIT_LIST_B = LIMIT_LIST_INIT //Nombre d'élément afficher pour la seconde liste

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
	export let givebacks = []
	export let payments = []

	export let providedPromise
	export let purchasesPromise
	export let givebacksPromise
	export let paymentsPromise

	let modifiedArticles = []
	let clearModifiedArticles

	onMount(() => {
		if (userId && trocId) {
			getTarif()
			providedPromise = getProvided()
			purchasesPromise = getPurchases()
			givebacksPromise = getGivebacks()
			paymentsPromise = getPayments()			
		}else{
			console.log('userId and trocId required !')
		}
	})

	async function getProvided() {
		let res = await fetch(`/articles?troc=${trocId}&provider=${userId}`)
		let json = await res.json()
		if (res.ok) {
			provided = json
			return
		}
	}

	async function getPurchases() {
        let res = await fetch(`/articles?buyer=${userId}`)
        let json = await res.json()
        if (res.ok) {
			purchases = addTime(json, 'sold', 'soldTime')
            return
        }
	}

	async function getGivebacks() {
        let res = await fetch(`/articles?giveback.user=${userId}`)
        let json = await res.json()
        if (res.ok) {
			givebacks = json
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

	$: {//Calcul of sold -> bof bof

		//Purchases
		if (purchases.length) buySum = -purchases.map(a => a.price).reduce((acc, cur) => acc + cur)
		else buySum = 0

		//Payments
		if (payments.length) paySum = payments.map(a => a.amount).reduce((acc, cur) => acc + cur)
		else paySum = 0


		//Provide
		//TODO: Deplacer coté serveur
		if (provided.length) {
			let arr = provided.filter(a => a.sold).map(a => a.price)
			soldSum = arr.length ? arr.reduce((acc, cur) => acc + cur) : 0

			arr = provided.filter(a => a.valided).map(a => a.fee)
			feeSum = arr.length ? -arr.reduce((acc, cur) => acc + cur) : 0

			arr = provided.filter(a => a.sold).map(a => a.price * a.margin)
			feeSum -= arr.length ? arr.reduce((acc, cur) => acc + cur) : 0
		}else{
			soldSum = 0
			feeSum = 0
		}

		//balance
		balance = Math.round((buySum + paySum + soldSum + feeSum) * 100) / 100

	}

	//For AutoPatch
	function addModifiedArticle(art) {

		let index = provided.map(a => a._id).indexOf(art._id)
		provided[index].fee = getFee(art, tarif)
		provided[index].margin = getMargin(art, tarif)

		index = modifiedArticles.map(a => a._id).indexOf(art._id)
		if (index == -1) {
			modifiedArticles = [...modifiedArticles, art]
		}else{
			modifiedArticles[index] = art
		}
		clearTimeout(clearModifiedArticles)
		clearModifiedArticles = setTimeout(() => modifiedArticles = [], 700)
	}

	function createArticle() {
		fetch('/articles', getHeader({troc: trocId, provider: userId}))
		.then(res => res.json())
		.then(json => {
			if (json.success) {
				provided = [...provided, json.message]
				setTimeout(() => {
					let table = document.getElementById(`tableArticles${trocId}`)
					//table.getElementsByClassName('lastInputName')[0].focus() //Focus on the last element
					table.getElementsByClassName('w3-input')[0].focus()	
				},100)
			}else alert(json.message)
		})
	}

	function deleteArticle(index) {
		fetch(`/articles/${provided[index]._id}`, getHeader({}, 'DELETE'))
		.then(res => res.json())
		.then(json => {
			if (json.success) {
				provided.splice(index, 1)
				provided = provided
			}else alert(json.message)
		})
	}
	
	function getTarif() {
		fetch(`/trocs/${trocId}/tarif/${userId}`)
		.then(res => res.json())
		.then(json => {
			tarif = json
		})
	}

	let status = ['Proposé', 'En vente', 'Vendu', 'Récupéré']
	function getStatus(art) {
		if (!art.valided) return status[0]
		if (art.sold) return status[2]
		if (art.recover) return status[3]
		return status[1]
	}

</script>

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
					<div class="w3-center"><img src="favicon.ico" alt="Logo trocio" class="w3-spin"></div>
				{:then}
					{#each purchases.slice(0, LIMIT_LIST_A) as article (article._id)}
						<Article article={article} timeKey={'soldTime'}/>
					{:else}
						<span class="w3-opacity w3-margin-left">Pas d'achat</span>
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
						<img src="favicon.ico" alt="Logo trocio" class="w3-spin">
					</div>
				{:then}
					{#each payments.slice(0, LIMIT_LIST_B) as payment (payment._id)}
						<div class="list-element valided w3-padding" in:receive="{{key: payment._id}}"  animate:flip="{{duration: 200}}">
							{dayjs(payment.createdAt).fromNow()}
							<br>
							<b class="w3-tiny w3-right" style="line-height: 1;">{payment.amount.toFixed(2)}</b>
							<span class="w3-tiny" style="line-height: 1;">{payment.message}</span>
						</div>
					{:else}
						<span class="w3-opacity">Pas de paiements enregistré !</span>
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

	<div class="w3-row">
		<span class="w3-right w3-large">{(soldSum + feeSum).toFixed(2)}</span>
		<span class="w3-large">Ventes</span>

		{#await providedPromise}
			<div class="w3-center"><img src="favicon.ico" alt="Logo trocio" class="w3-spin"></div>
		{:then}
			

			<!-- Bontons puor proposer des articles -->
			<div on:click={createArticle} class="w3-button w3-border w3-round" style="margin-left: 20px;">
				Proposer un article
			</div>
			<span> ou </span>
			<div on:click={createArticle} class="w3-button w3-border w3-round">
				Proposer plein d'articles
			</div>
			

			<AutoPatch source="{`tableArticles${trocId}`}" path="/articles" body={modifiedArticles} />
			<table id="{`tableArticles${trocId}`}" class="w3-table w3-bordered w3-margin-top">
				<tr>
					<th>Articles</th>
					<th>Status</th><!-- 0=Proposé, 1=Fournit, 2=Vendu, 3=Récupéré -->
					<th>Prix <span class="w3-small sold">{soldSum.toFixed(2)}</span></th>
					<th>Frais 
						<span class="w3-opacity w3-tiny">(traitement + marge)</span>
						<span class="w3-small fee">{feeSum.toFixed(2)}</span>
					</th>
					<th></th><!--remove-->
				</tr>
				{#each provided.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()) as article, i}

					<tr in:slide>
						
						<!-- Designation -->
						<td class="tdInput">
							<b class="w3-small" style="position: absolute; transform: translate(-28px, 12px);">
								{!article.isCreated ? article.ref : ''}
							</b>
							<input
								on:input="{() => addModifiedArticle(article)}"
								class:lastInputName="{i == provided.length-1}"  
								bind:value={article.name}
								type="text" 
								class="w3-input" 
								readonly={article.valided}
								class:unvalided={!article.valided}
								class:recovered={article.recover}
								placeholder="Nom complet">
						</td>

						<!-- Status -->
						<td>{getStatus(article)}</td>

						<!-- Prix -->
						<td class="tdInput price">
							<input
								on:input="{() => addModifiedArticle(article)}"
								bind:value={article.price}
								type="number"
								class="w3-input"
								readonly={article.valided}
								class:unvalided={!article.valided}
								class:recovered={article.recover}
								class:sold={article.sold}
								placeholder="Prix"
								step="0.05"
								min="0">
						</td>

						<!-- Frais -->
						<td class:w3-opacity={!article.valided} class="fee" class:unvalided={!article.valided}>
							{article.fee.toFixed(2)}
							{@html article.sold ? ` <span class="w3-tiny">+</span> ${article.margin.toFixed(2)}` : ''}
						</td>

						<!-- Suppression (uniquement les articles non validé) -->
						<td>
							{#if !article.valided}
								<i on:click="{() => deleteArticle(i)}" class="fa fa-times"></i>
							{/if}
						</td>
					</tr>

				{/each}
			</table>
		{/await}
		
	</div>


</div>

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
	input[type=text] {
		word-break: break-word;
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