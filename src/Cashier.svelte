<script>
	import { onMount } from 'svelte'
	import { quintOut } from 'svelte/easing'
	import { crossfade } from 'svelte/transition'
	import { flip } from 'svelte/animate'
    import { troc } from './stores'
	import SearchUser from './SearchUser.svelte'
	import { getHeader } from './utils.js'
	
	let user = {}
	let userOk = false


	let action = 0
	let actions = [
		{id: 0, name: 'Fournit'},
		{id: 1, name: 'Achète'},
		{id: 2, name: 'Récupère'},
		{id: 3, name: 'Retourne'},
		{id: 4, name: 'Règle le solde'},
	]

	let articles = []
	let newArticle = {name: '', price: null}

	const [send, receive] = crossfade({
		duration: d => Math.sqrt(d * 200),

		fallback(node, params) {
			const style = getComputedStyle(node)
			const transform = style.transform === 'none' ? '' : style.transform

			return {
				duration: 600,
				easing: quintOut,
				css: t => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
			}
		}
	})

    onMount(() => {
		if (document.location.hash.substr(1).length == 24) {
			troc.find(document.location.hash.substr(1))
		} else {
			$troc = {failed: true, reason: 'Bad request'}
		}
    })
    
	function userSelected(e){
		user = e.detail
		getArticles()
	}

	function getArticles() {
		fetch(`/articles?provider=${user._id}&troc=${$troc._id}`)
		.then(res => res.json())
		.then(json => articles = json)
	}

	function createArticle() {
		if (newArticle.name.length > 2 && newArticle.price != null) {
			fetch('/articles', getHeader({
				troc: $troc._id, 
				provider: user._id,
				name: newArticle.name,
				price: newArticle.price,
				valided: new Date()
			}))
			.then(res => res.json())
			.then(json => {
				if (json.success) {
					articles = [json.message, ...articles]
					newArticle = {name: '', price: null}
				}else alert(json.message)
			})			
		}
	}

	$: console.log(articles);

</script>

<!-- Check if all is OK ! -->
{#if $troc.failed}
	<div class="w3-display-container">
		<div class="w3-display-middle w3-red w3-padding w3-round w3-large w3-center">
			<i class="fas fa-bug"></i> Oups ! <br>
			{#if $troc.reason == 'Not found'}
				<span>Ce troc n'éxiste pas !</span>
			{:else if $troc.reason == 'Bad request'}
				<span>La requête n'est pas valide !</span>
			{:else}
				<span>Vous n'avez pas accès à la caisse de ce troc !</span>
			{/if}
		</div>
	</div>
{:else}
	<div class="w3-card w3-padding w3-round" style="max-width: 850px; margin: auto;">
		<div class="w3-row w3-margin-top">

			<!-- Utilisateur -->
			<div class="w3-col s6 w3-padding">
				<div class="icon iconUser">
					<i class:far={!userOk} class:fas={userOk} class="fa-user w3-large"></i>
				</div>
				<div class="w3-right" style="width: calc(100% - 22px);">
					<SearchUser modeSelect 
								id="1"
								search=".com"
								placeholder="Choisissez un utilisateur"
								bind:selectOk={userOk}
								on:select="{userSelected}"/>
				</div>
			</div>

			<!-- Action -->
			<div class="w3-col s6 w3-padding">
				<select bind:value={action} class="w3-input">
				{#each actions as a}
					<option value="{a.id}">{a.name}</option>
				{/each}
				</select>
			</div>

		</div>

		{#if userOk}
		<div class="w3-row">
		
			{#if action == 0} <!-- Fournit -->
				<div class="w3-col w3-padding">
					<br>

					<input 	bind:value={newArticle.name} 
							on:keydown="{e => e.which == 13 && createArticle()}"
							type="text" class="w3-input"
							placeholder="Nouvel article fourni"
							style="display: inline-block; width: 78%;">

					<input 	bind:value={newArticle.price}
							on:keydown="{e => e.which == 13 && createArticle()}"
							type="number" min="0"
							class="w3-input w3-right"
							placeholder="Prix"
							style="display: inline-block; width: 20%;">

					<br>
					<br>
					
					<div class="w3-col s6">
						<div class="w3-margin-right">
							<h4>Proposés</h4>
							{#each articles.filter(a => !a.valided) as article (article._id)}
								<div class="list-element w3-padding clickable" 
									 in:receive="{{key: article._id}}"
									 out:send="{{key: article._id}}"
									 animate:flip="{{duration: 200}}"
									 on:click="{() => {article.valided = new Date(); article.isNew = true}}">
									{article.name}
								</div>
							{:else}
								<span class="w3-opacity">Pas d'articles proposés !</span>
							{/each}
						</div>
					</div>
					

					<div class="w3-col s6">
						<div class="w3-margin-left">
							<h4>Fournis</h4>

							{#each articles.filter(a => !!a.valided) as article (article._id)}
								<div class="list-element valided w3-padding w3-display-container"
									 in:receive="{{key: article._id}}"
									 out:send="{{key: article._id}}"
									 animate:flip="{{duration: 200}}">
									
									{article.name}
									

									<div class="w3-display-topright w3-padding">
										{#if article.isNew}
											
											<i class="fa fa-check" style="margin-top: 4px;"></i>
											<i 	class="fa fa-trash-alt clickable"
												style="margin-top: 4px;"
												on:click="{() => article.valided = undefined}"></i>
											
										{:else}
											<i class="fa fa-tag" style="margin-top: 4px;"></i>
											 ref12353
										{/if}
										
									</div>


								</div>
							{/each}
						</div>
					</div>

					{#if articles.filter(a => !!a.valided && a.isNew).length == 1}
						<div class="w3-right w3-round w3-padding validButton">
							Valider l'article fourni
						</div>
					{:else if articles.filter(a => !!a.valided && a.isNew).length > 0}
						<div class="w3-right w3-round w3-padding validButton">
							Valider les {articles.filter(a => !!a.valided && a.isNew).length} articles fournis
						</div>
					{/if}
					
				</div>
				
			{:else if  action == 1} <!-- Achète -->
				Achète
			{:else if  action == 2} <!-- Récupère -->
				Récupère
			{:else if  action == 3} <!-- Retourne -->
				Retourne
			{:else if  action == 4} <!-- Règle le solde -->
				Règle

			{/if}
		
		</div>

		{:else}
			Choose an user
		{/if}

	</div>

{/if}


<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>
    .w3-display-container {
        height: calc(100% - 57px);
    }

	.clickable{
		cursor: pointer;
	}

	.icon {
		display: inline-block;
		padding-top: 10px;
	}

	select {
		cursor: pointer;
		height: 39px;
	}

	option {
		cursor: pointer;
	}

	.iconUser i{
		transition: all .15s;
	}

	.iconUser .fas {
		transform: scale(1.2);
	}
	
	.validButton {
		cursor: pointer;
		color: white;
		background: rgb(76, 175, 80);
		border: solid 3px;
		border-color: rgb(76, 175, 80);
		transition: all .3s;
	}

	.validButton:hover {
		border-color: rgb(76, 130, 80);
	}

	.list-element {
		background: rgb(250, 250, 250);
		border: solid 1px rgb(220, 220, 220);
		margin-bottom: 10px;
		border-radius: 4px;
		overflow-x: hidden;
	}

	.list-element.valided {
		background: white;
	}

	.list-element .fa-trash-alt {
		transform: translate(30px, 0px);
		transition: .15s transform ease;
	}

	.list-element .fa-check {
		transform: translate(20px, 0px) scale(1);
		transition: .15s transform ease;
	}

	.list-element:hover .fa-trash-alt {
		transform: translate(0px, 0px);
	}
	.fa-trash-alt:hover {
		transform: scale(1.3) !important;
	}

	.list-element:hover .fa-check {
		transform: scale(0);
	}

</style>