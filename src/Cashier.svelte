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
		{id: 0, name: 'Fournit'},
		{id: 1, name: 'Achète'},
		{id: 2, name: 'Récupère'},
		{id: 3, name: 'Retourne'},
		{id: 4, name: 'Règle le solde'},
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
	<br>
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
		<div class="w3-row w3-padding">
		    <br>

			{#if action == 0} <!-- Fournit -->
				
				<Provide bind:user/>

			{:else if  action == 1} <!-- Achète -->

				<Buy bind:user/>

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