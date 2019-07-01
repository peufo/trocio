<script>
	import { troc } from './stores'
	import { onMount } from 'svelte'
	import { getHeader, updateTroc } from './utils'
	import AutoPatch from './AutoPatch.svelte'

	export let createMode = false
	export let _id
	export let name = ''
	export let address = ''
	export let town = ''
	export let country = ''
	export let description = ''
	export let open = ''
	export let close = ''
	export let society = ''
	export let societyweb = ''


	let valid = false
	$: {
		valid = true
		if (!name || !address  || !town || !country || !description || !open || !close) valid = false
	}

	//TODO: Traiter la création
	function create() {
		if (valid) {
			console.log('post')
		}
	}

</script>

{#if !createMode}
	<AutoPatch path="{`/trocs/${_id}`}" valid={valid} body="{{name, address, town, country, description, open, close, society, societyweb}}"/>
{/if}
<form class="w3-center">
	<br>
	<h3>Mon troc</h3>
	<input bind:value={name} class="w3-input" type="text" name="name" placeholder="Nom de l'évènement">
	<input bind:value={address} class="w3-input" type="text" name="address" placeholder="Adresse">
	<input bind:value={town} class="w3-input" type="text" name="town" placeholder="Ville">
	<input bind:value={country} class="w3-input" type="text" name="country" placeholder="Pays">
	<textarea bind:value={description} class="w3-round" placeholder="Déscription" rows="6"></textarea>
	<div class="w3-row">
		<div class="datepicker w3-round w3-col">
			Ouverture
			<input bind:value={open} class="w3-padding w3-round" type="date" name="open">	
		</div>
		<div class="datepicker w3-round w3-right">
			Fermeture
			<input bind:value={close} class="w3-padding" type="date" name="close">
		</div>				
	</div>

	<br>
	<h3>Mon organisation <span class="w3-small w3-opacity">Pas obligatoire</span></h3>
	<input bind:value={society} class="w3-input" type="text" name="society" placeholder="Nom">
	<input bind:value={societyweb} class="w3-input" type="text" name="societyweb" placeholder="Site internet">
	{#if createMode}
		<br><br>
		<div on:click={create} 
			class:w3-disabled={!valid} 
			class="w3-button w3-border w3-round">
			Créer mon troc
		</div>
	{/if}
	
</form>

<style>
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