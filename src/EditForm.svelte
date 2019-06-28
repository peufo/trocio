<script>
	import { troc } from './stores'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

	export let createMode = false
	let editTroc = createMode ? {} : $troc


	let saveLabel = createMode ? 'Créer mon troc' : 'Sauvegarder'
	let props = ['name', 'address', 'town', 'country', 'description', 'open', 'close', 'society', 'societyweb']
	let propsOptional = ['society', 'societyweb']

	function init() {
		if (createMode) {
			props.forEach(prop => editTroc[prop] = '')
		}else{
			props.forEach(prop => editTroc[prop] = $troc[prop])	
		}
	}

	init()
	$: $troc ? init() : () => {}
	$: editTroc.open = editTroc.open ? editTroc.open.substr(0, 10) : ''
	$: editTroc.close = editTroc.close ? editTroc.close.substr(0, 10) : ''


	let valid = false
	$: {
		valid = true
		props.forEach(prop =>  { if (!editTroc[prop] && propsOptional.indexOf(prop) == -1) valid = false })
	}


	function save() {
		if (!valid) return
		dispatch('save', editTroc)
	}


</script>

<form class="w3-center">
	<br>
	<h3>Mon troc</h3>
	<input bind:value={editTroc.name} class="w3-input" type="text" name="name" placeholder="Nom de l'évènement">
	<input bind:value={editTroc.address} class="w3-input" type="text" name="address" placeholder="Adresse">
	<input bind:value={editTroc.town} class="w3-input" type="text" name="town" placeholder="Ville">
	<input bind:value={editTroc.country} class="w3-input" type="text" name="country" placeholder="Pays">
	<textarea bind:value={editTroc.description} class="w3-round" placeholder="Déscription" rows="6"></textarea>
	<div class="w3-row">
		<div class="datepicker w3-round w3-col">
			Ouverture
			<input bind:value={editTroc.open} class="w3-padding w3-round" type="date" name="open">	
		</div>
		<div class="datepicker w3-round w3-right">
			Fermeture
			<input bind:value={editTroc.close} class="w3-padding" type="date" name="close">
		</div>				
	</div>

	<br>
	<h3>Mon organisation <span class="w3-small w3-opacity">Pas obligatoire</span></h3>
	<input bind:value={editTroc.society} class="w3-input" type="text" name="society" placeholder="Nom">
	<input bind:value={editTroc.societyweb} class="w3-input" type="text" name="societyweb" placeholder="Site internet">

	<br><br>
	<input on:click={save} class:w3-disabled={!valid} class="w3-button w3-xlarge w3-border w3-round" type="button" name="submit" value="{saveLabel}">
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