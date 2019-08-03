<script>
	import { fade, slide } from 'svelte/transition'
	import { me } from './stores'
	import { onMount } from 'svelte'
	import { getHeader } from './utils'
	import AutoPatch from './AutoPatch.svelte'
	import dayjs from 'dayjs'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')


	export let userId = false
	export let trocId = false

	onMount(() => {
		if (userId && trocId) {
			getArticles()
			getTarif()
		}else{
			console.log('userId and trocId required !')
		}
	})

	let articles = []
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
	
	function getArticles() {
		fetch(`/articles?provider=${userId}&troc=${trocId}`)
		.then(res => res.json())
		.then(json => articles = json)				
	}

	function createArticle() {
		fetch('/articles', getHeader({troc: trocId, provider: userId}))
		.then(res => res.json())
		.then(json => {
			if (json.success) {
				articles = [...articles, json.message]
				setTimeout(() => {
					let table = document.getElementById(`tableArticles${trocId}`)
					table.getElementsByClassName('lastInputName')[0].focus()
				},100)
			}else alert(json.message)
		})
	}

	function deleteArticle(index) {
		fetch(`/articles/${articles[index]._id}`, getHeader({}, 'DELETE'))
		.then(res => res.json())
		.then(json => {
			if (json.success) {
				articles.splice(index, 1)
				articles = articles
			}else alert(json.message)
		})
	}
	
	function getTarif() {
		fetch(`/trocs/${trocId}/tarif`)
		.then(res => res.json())
		.then(json => {
			let tarifMatched = json.tarif.filter(t => t.apply.map(a => a._id).indexOf(userId) != -1)
			tarif = tarifMatched[0] || json.tarif[0]
		})				
	}

	function getFee(price) {
		if (tarif && price > 0) {
			return tarif.fee.sort((a, b) => b.price - a.price).filter(f => f.price <= price)[0].value
		}
		return 0
	}


</script>

<div id="container" class="w3-padding">
	
	<div class="w3-row">
		<div class="w3-large w3-center">
			<span class="w3-opacity">Solde actuel </span>
			<span>100.00</span>
		</div>
	</div>
	<br>

	<div class="w3-row">
		<span class="w3-large">Achats</span>

		<ul id="buys" class="w3-ul">
			<li>
				Article A
				<span class="w3-right">100.00</span>
				<br>
				<span class="w3-small w3-opacity">
					{dayjs().format('Le DD MMMM YYYY')}
				</span>
			</li>
			<li>
				Article B
				<span class="w3-right">50.00</span>
				<br>
				<span class="w3-small w3-opacity">
					{dayjs().format('Le DD MMMM YYYY')}
				</span>
			</li>
			<li>
				<b class="w3-right w3-border-top">150.00</b>
			</li>
		</ul>	
	</div>
	<br>

	<div class="w3-row">
		<span class="w3-large">Payments</span>

		<ul class="w3-ul">
			<li>
				{dayjs().format('Le DD MMMM YYYY')}
				<span class="w3-right">50.00</span>
			</li>
			<li>
				{dayjs().format('Le DD MMMM YYYY')}
				<span class="w3-right">20.00</span>
			</li>

			<li>
				<b class="w3-right w3-border-top">70.00</b>
			</li>

		</ul>

	</div>
	<br>

	<div class="w3-row">
		<span class="w3-large">Ventes</span>

		<AutoPatch source="{`tableArticles${trocId}`}" path="/articles" body={modifiedArticles} />
	
		<table id="{`tableArticles${trocId}`}" class="w3-table w3-bordered">
			<tr>
				<th>Articles</th>
				<th>Status</th><!-- Proposé Fournit Vendu Récupéré -->
				<th>Prix</th>
				<th>Frais</th>
				<th></th>
			</tr>
			{#each articles as article, i}

			{#if !article.valided && !article.refused}

				<tr in:slide>
					<td class="tdInput">
						<input
							on:input="{() => addModifiedArticle(article)}"
							class:lastInputName="{i == articles.length-1}" 
							bind:value={article.name} 
							type="text" 
							class="w3-input" 
							placeholder="Nom complet">
					</td>
					<td>Proposé</td>
					<td class="tdInput">
						<input
							on:input="{() => addModifiedArticle(article)}"
							bind:value={article.price}
							type="number"
							class="w3-input"
							placeholder="Prix"
							min="0">
					</td>
					<td class:w3-opacity={!article.valided}>
						{article.fee}
						{article.sold ? ` + ${article.price * article.margin}` : ''}
					</td>
					<td>
						<i on:click="{() => deleteArticle(i)}" class="fa fa-times"></i>
					</td>
				</tr>
			{/if}

			{/each}
		</table>

		
		<div in:fade
				on:click="{() => !articles.filter(a => !a.name.length || !a.price).length && createArticle()}"
				class:w3-disabled="{articles.filter(a => !a.name.length || !a.price).length}"
				class="w3-button w3-border w3-round w3-margin-top w3-right">
			+1 article
		</div>
		
	</div>


</div>

<!--
	<div transition:fade class="w3-modal" on:click={closeCreatArticle}>
		<div class="w3-modal-content w3-padding w3-round">
			<i class="fa fa-times w3-large w3-right w3-margin"></i>
			<h2 class="w3-center">Nouvel article</h2>
			<div class="w3-row">
				<input class="w3-input w3-large w3-col m10" type="text" placeholder="Nom complet">
				<input class="w3-input w3-large w3-col m2" type="number" placeholder="Prix">
			</div>


			<div>
				<div class="w3-large w3-button w3-border w3-round w3-right">
					Proposer
				</div>

								
				<div class="note w3-theme-l4 w3-leftbar w3-small w3-margin-top">
					<p>
						Vous êtes soumis au tarif "{tarif.name}"
						<br>Si votre article est vendu, la marge de l'organisateur ce monte à {tarif.margin * 100}%
					</p>
				</div>				
			</div>

		</div>
	</div>
-->

<style>

	#container {
		position: relative;
	}
	.note {
		padding: 8px;
		width: calc(100% - 200px);
	}
	.w3-col {
		padding-left: 5px;
		padding-right: 5px;
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
	.w3-ul li {
		border: none;
	}

	input[type=number] {
		width: 6em;
	}
	input[type=text] {
		word-break: break-word;
	}
	
	#buys li:not(:last-child){
		line-height: 90%;
	}

</style>