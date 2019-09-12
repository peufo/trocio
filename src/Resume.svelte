<script>
	import { fade, slide } from 'svelte/transition'
	import { me } from './stores'
	import { onMount } from 'svelte'
	import { flip } from 'svelte/animate'
	import { crossfade } from 'svelte/transition'
	import { getHeader, crossfadeConfig } from './utils'
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

	export let sold = 0
	export let buySum = 0
	export let paySum = 0
	export let provideSum = 0

	export let provided = []
	export let purchases = []
	export let payments = []

	export let providedPromise
	export let purchasesPromise
	export let paymentsPromise


	onMount(() => {
		if (userId && trocId) {
			getTarif()
		}else{
			console.log('userId and trocId required !')
		}
	})

	$: console.log(provided)

	$: {//Calcul of sold -> bof bof

		//Purchases
		if (purchases.length) buySum = -purchases.map(a => a.price).reduce((acc, cur) => acc + cur)
		else buySum = 0

		//Payments
		if (payments.length) paySum = payments.map(a => a.amount).reduce((acc, cur) => acc + cur)
		else paySum = 0


		//Provide
		//TODO


		//sold
		sold = buySum + paySum + provideSum

	}

	let tarif = undefined
	let modifiedArticles = []
	let clearModifiedArticles

	function addModifiedArticle(art) {
		let index = modifiedArticles.map(a => a._id).indexOf(art._id)
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
					table.getElementsByClassName('lastInputName')[0].focus()
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
		fetch(`/trocs/${trocId}/tarif`)
		.then(res => res.json())
		.then(json => {
			//transferer le boulot coté serveur ?
			let tarifMatched = json.tarif.filter(t => t.apply.map(a => a._id).indexOf(userId) != -1)
			tarif = tarifMatched[0] || json.tarif[0]
		})
	}

	function getFee(art) {
		if (tarif && art.price > 0) {
			return art.fee = tarif.fee.sort((a, b) => b.price - a.price).filter(f => f.price <= art.price)[0].value
		}else if (art.price == 0) {
			return art.fee = 0
		}else return art.fee
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
			<span>{sold.toFixed(2)}</span>
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

	<div class="w3-row">
		<span class="w3-large">Ventes</span>

		<AutoPatch source="{`tableArticles${trocId}`}" path="/articles" body={modifiedArticles} />
	
		<table id="{`tableArticles${trocId}`}" class="w3-table w3-bordered">
			<tr>
				<th>Articles</th>
				<th>Status</th><!-- 0=Proposé, 1=Fournit, 2=Vendu, 3=Récupéré -->
				<th>Prix</th>
				<th>Frais <span class="w3-opacity w3-tiny">(traitement + marge)</span></th>
				<th></th>
			</tr>
			{#each provided as article, i}

				<tr in:slide>

					<!-- Designation -->
					<td class="tdInput">
						{#if article.valided}
							{article.name}
						{:else}
							<input
								on:input="{() => addModifiedArticle(article)}"
								class:lastInputName="{i == provided.length-1}" 
								bind:value={article.name}
								type="text" 
								class="w3-input" 
								placeholder="Nom complet">
						{/if}
					</td>

					<!-- Status -->
					<td>{getStatus(article)}</td>

					<!-- Prix -->
					<td class="tdInput price">
						{#if !article.valided}
							<input
								on:input="{() => addModifiedArticle(article)}"
								bind:value={article.price}
								type="number"
								class="w3-input"
								calss:w3-opactiy={!article.sold}
								placeholder="Prix"
								min="0">
						{:else if !article.recover}
							<div class="w3-padding" class:w3-opacity={!article.sold}>
								{article.valided & article.price}
							</div>
						{/if}
					</td>

					<!-- Frais -->
					<td class:w3-opacity={!article.valided} class="fee">
						{getFee(article)}
						{@html article.sold ? ` <span class="w3-tiny">+</span> ${article.price * article.margin}` : ''}
					</td>

					<!-- Suppression (uniquement les articles non validé) -->
					<td>
						<i on:click="{() => deleteArticle(i)}" class="fa fa-times"></i>
					</td>
				</tr>

			{/each}
		</table>

		
		<div in:fade
				on:click="{() => !provided.filter(a => !a.name.length || !a.price).length && createArticle()}"
				class:w3-disabled="{provided.filter(a => !a.name.length || !a.price).length}"
				class="w3-button w3-border w3-round w3-margin-top w3-right">
			+1 article
		</div>
		
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

	.fee {
		color: red;
	}


</style>