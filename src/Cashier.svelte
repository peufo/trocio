<script>
	import { onMount } from 'svelte'
    import { troc } from './stores'
	import SearchUser from './SearchUser.svelte'
	import Provide from './Provide.svelte'
	import Buy from './Buy.svelte'

	let user = {}
	let userOk = false

	let action = 1
	let actions = [
		{id: 0, name: 'Fournit', icon: '<i></i>'},
		{id: 1, name: 'Achète', icon: '<i></i>'},
		{id: 2, name: 'Récupère', icon: '<i></i>'},
		{id: 3, name: 'Retourne', icon: '<i></i>'},
	]

    onMount(() => {
		if (document.location.hash.substr(1).length == 24) {
			troc.find(document.location.hash.substr(1))
		} else {
			$troc = {failed: true, reason: 'Bad request'}
		}
    })
    
	function userSelected(e){
		user = e.detail
		//getArticles()
	}

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

	<div class="w3-card w3-round" style="max-width: 850px; margin: auto; height: calc(100% - 45px)">
		<div class="w3-row w3-padding">

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

			<!-- Règle le solde -->
			
			<div class:visible={userOk} class="hide w3-col s6 w3-padding">
				<div class="validButton w3-right w3-round">Régler le solde de 200.00 </div>
			</div>
			

		</div>


		
		<div class:visible={userOk} class="hide" style="height: calc(100% - 126px);">

			<!-- Action -->
			<div class="onglets w3-margin-top w3-border-top">
				{#each actions as tab, i}
					<div class="w3-padding underline-div onglet"
						on:click="{() => action = i}"
						class:actived="{action == i}">
						{@html tab.icon}
						<span class="underline-span">{tab.name}</span>
					</div>
				{/each}

			</div>

			
			<div class="tabs" style="height: 100%;">

				<!-- Fournit -->
				<div class="tab" class:center={action == 0} class:left={action > 0}>
					<br>
					<Provide bind:user/>
				</div>
				<!-- Achète -->
				<div class="tab" class:center={action == 1} class:left={action > 1} class:right={action < 1}>
					<br>
					<Buy bind:user/>
				</div>
				<!-- Récupère -->
				<div class="tab" class:center={action == 2} class:left={action > 2} class:right={action < 2}>
					<br>
					Récupère
				</div>
				<!-- Retourne -->
				<div class="tab" class:center={action == 3} class:right={action < 3}>
					<br>
					Retourne
				</div>

			
			</div>

		</div>

	</div>

{/if}


<svelt:head>
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>
    .w3-display-container {
        height: calc(100% - 57px);
	}
	
	.tab {
		padding-left: 32px;
		padding-right: 32px;
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

</style>