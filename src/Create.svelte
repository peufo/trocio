<script>
	import { fade } from 'svelte/transition'
	import { me, troc } from './stores'

	export let open = false

	let newTroc = initTroc()

	function initTroc() {
		return {
			name: '',
			address: '',
			town: '', 
			country: '',
			description: '',
			open: '',
			close: '',
			society: '',
			societyweb: ''			
		}
	}


	let valid = false
	$: valid = !!newTroc.name && !!newTroc.address && !!newTroc.town && !!newTroc.country && !!newTroc.description && !!newTroc.open && !!newTroc.close

	function create() {
		if (!valid) return
		fetch('/trocs', {
			method: 'POST',
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(newTroc)
		})
		.then(res => res.json())
		.then(json => {
			if (json.success) {
				$me.trocs = [...$me.trocs, {troc: json.message}]
				$troc = json.message
				newTroc = initTroc()
				open = false
			}else{
				//alert(json.message)
				alert('Erreur !')
			}
		})
	}

	function close(e) {
		if (e.target.className.indexOf('w3-modal ') > -1) {
			open = false
		}
	}


</script>

{#if open}
<div class="w3-modal" on:click={close} transition:fade>
	<div class="w3-modal-content w3-padding w3-center w3-round">
		<h1>Création d'un nouveau troc</h1>
		<form>
			<br>
			<h3>Mon troc</h3>
			<input bind:value={newTroc.name} class="w3-input" type="text" name="name" placeholder="Nom de l'évènement">
			<input bind:value={newTroc.address} class="w3-input" type="text" name="address" placeholder="Adresse">
			<input bind:value={newTroc.town} class="w3-input" type="text" name="town" placeholder="Ville">
			<input bind:value={newTroc.country} class="w3-input" type="text" name="country" placeholder="Pays">
			<textarea bind:value={newTroc.description} class="w3-round" placeholder="Déscription" rows="6"></textarea>
			<div class="w3-row">
				<div class="datepicker w3-round w3-col">
					Ouverture
					<input bind:value={newTroc.open} class="w3-padding w3-round" type="date" name="open">	
				</div>
				<div class="datepicker w3-round w3-right">
					Fermeture
					<input bind:value={newTroc.close} class="w3-padding" type="date" name="close">
				</div>				
			</div>

			<br>
			<h3>Mon organisation <span class="w3-small w3-opacity">Pas obligatoire</span></h3>
			<input bind:value={newTroc.society} class="w3-input" type="text" name="society" placeholder="Nom">
			<input bind:value={newTroc.societyweb} class="w3-input" type="text" name="societyweb" placeholder="Site internet">

			<br><br>
			<input on:click={create} class:w3-disabled={!valid} class="w3-button w3-xlarge w3-border w3-round" type="button" name="submit" value="Créer mon troc">
		</form>
	</div>
</div>
{/if}


<style>
	.w3-modal {
		display: block;
	}

	form {
		max-width: 500px;
		margin: auto;
	}

	.datepicker {
		margin-top: 10px;
		width: 45%;
		border: 1px solid #d6d6d6;
		padding-top: 5px;
		padding-bottom: 5px;
	}

	input[type=date] {
		border: none;
	}

	h3 {
		border-bottom: 2px solid #d6d6d6;
	}

	textarea {
		margin-top: 10px;
		resize: vertical;
		border: 1px solid #d6d6d6;
		width: 100%;
	}
</style>