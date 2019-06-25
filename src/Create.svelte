<script>
	import { troc, me } from './stores'
	import { fade } from 'svelte/transition'
	import EditForm from './EditForm.svelte'

	export let open = false

	function close(e) {
		if (e.target.className.indexOf('w3-modal ') > -1) {
			open = false
		}
	}

	function create(e) {
		fetch('/trocs', {
			method: 'POST',
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(e.detail)
		})
		.then(res => res.json())
		.then(json => {
			if (json.success) {
				let newTroc = json.message
				newTroc.admin.name = newTroc.cashier.name = $me.name
				$me.trocs = [...$me.trocs, {troc: newTroc}]
				$troc = newTroc
				open = false
			}else{
				//alert(json.message)
				alert('Erreur !')
			}
		})
	}


</script>

{#if open}
<div class="w3-modal" on:click={close} transition:fade>
	<div class="w3-modal-content w3-padding w3-center w3-round">
		<h1>Création d'un nouveau troc</h1>
		<EditForm createMode on:save={create}/>
	</div>
</div>
{/if}


<style>
	.w3-modal {
		display: block;
	}
</style>