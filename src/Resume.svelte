<script>
	import { fade, slide } from 'svelte/transition'
	import { me, troc } from './stores'
	import { onMount } from 'svelte'
	import { getHeader } from './utils'
	import AutoPatch from './AutoPatch.svelte'

	//En fonction de moi ou d'un autre
	export let userId = false

	onMount(() => {
		console.log('mount')
	})

	let articles = []
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

	$:{
		if ($me._id && $troc._id) getArticles()			
	}
	
	$: console.log(modifiedArticles)

	function getArticles() {
		fetch(`/articles?provider=${userId || $me._id}&troc=${$troc._id}`)
		.then(res => res.json())
		.then(json => articles = json)				
	}

	function createArticle() {
		fetch('/articles', getHeader({troc: $troc._id, provider: userId || $me._id}))
		.then(res => res.json())
		.then(json => {
			if (json.success) {
				articles = [...articles, json.message]
				setTimeout(() => {
					document.getElementsByClassName('lastInputName')[0].focus()
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
	
	let tarif = {}
	$: {
		if ($troc.tarif) {
			let tarifMatched = $troc.tarif.filter(t => t.apply.map(a => a._id).indexOf(userId) != -1)
			tarif = tarifMatched[0] || $troc.tarif[0]
		}
	}

	function getFee(price) {
		
		if (tarif) {
			return tarif.fee.sort((a, b) => b.price - a.price).filter(f => f.price <= price)[0].value
		}else return 0
		
		return 0
	}


</script>

<div class="w3-padding">
	
	<h2 class="w3-center w3-border-bottom">
		Solde: 100.00
	</h2>		

	<div class="w3-row">
		
		<div class="w3-col m6">
			<h3 class="w3-center w3-border-bottom">
				Ventes: 200.00
			</h3>

			<AutoPatch source="tableArticles" path="/articles" body={modifiedArticles} />
			
			<table id="tableArticles" class="w3-table w3-bordered">
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
							{(article.fee = getFee(article.price)).toFixed(2)}
							{article.sold ? ` + ${article.price * article.margin}` : ''}
						</td>
						<td>
							<i on:click="{() => deleteArticle(i)}" class="fa fa-times"></i>
						</td>
					</tr>
				{/if}

				{/each}
			</table>

			{#if !articles.filter(a => !a.name.length || !a.price).length }
			<div in:fade
				 on:click="{createArticle}"
				 class="w3-button w3-border w3-round w3-margin-top w3-right">
				+1 article
			</div>
			{/if}

		</div>

		<div class="w3-col m3">
			<h3 class="w3-center w3-border-bottom">
				Achats: -150.00
			</h3>

			<ul class="w3-ul">
				<li>Article A<em class="w3-right">100.00</em></li>
				<li>Article B<em class="w3-right">50.00</em></li>
			</ul>
		</div>

		<div class="w3-col m3">
			<h3 class="w3-center w3-border-bottom">
				Payment: 50.00
			</h3>

			<ul class="w3-ul">
				<li>{new Date().toLocaleString()}<em class="w3-right">50.00</em></li>
			</ul>
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
	.w3-modal {
		display: block;
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
	input[type=number] {
		width: 6em;
	}
	input[type=text] {
		word-break: break-word;
	}

</style>