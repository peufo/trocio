<script>
	import { me, troc } from './stores'
	import { fade } from 'svelte/transition'
	import EditForm from './EditForm.svelte'

	$: console.log($troc)

	let tabs = ['Informations', 'Travailleurs', 'Tarifications', 'Statistique']
	let tabSelected = 0


	function save(e) {
		fetch(`/trocs/${$troc._id}`, {
			method: 'PATCH',
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(e.detail)
		})
		.then(res => res.json())
		.then(json => {
			if (json.success) {
				let index = $me.trocs.map(t => t.troc._id).indexOf($troc._id)
				$me.trocs[index].troc = json.message
				$troc = json.message
			}else{
				alert('Erreur !')
			}
		})
	}


</script>

<style>
	
	button {
		border-radius: 5px 5px 0px 0px;
	}


</style>

<div in:fade>
	
	<div class="w3-bar w3-theme w3-large">
	{#each tabs as tab, i}
		<button 
			class="w3-bar-item w3-button" 
			on:click="{() => tabSelected = i}"
			class:w3-theme-l5="{tabSelected == i}">
			{tab}
		</button>
	{/each}
	</div>
	
	<div class="w3-margin">

	{#if tabSelected == 0}			<!-- Apercu -->
		<EditForm on:save={save} />
	{:else if tabSelected == 1}		<!-- Worker -->
		worker


	{:else if tabSelected == 2}		<!-- Tarif  -->
		Tarif


	{/if}		
	</div>

</div>