<script>
	import { me, troc } from './stores'
	import { onMount } from 'svelte'
	import { slide } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import dayjs from 'dayjs'
	import { getHeader, updateTroc } from './utils'
	import AutoPatch from './AutoPatch.svelte'
	import SearchAddress from './SearchAddress.svelte'

	export let createMode = false
	export let _id = ''
	export let name = ''
	export let address = ''
	export let location = {}
	export let description = ''
	export let schedule = []
	export let society = ''
	export let societyweb = ''
	export let image = ''

	//Schedule conversion
	if (!schedule.length) onMount(addSchedule)
	let scheduleIn = schedule.map(s => {
		return {
			day: 	dayjs(s.open).format('YYYY-MM-DD'),
			open: 	dayjs(s.open).format('HH:mm'),
			close: 	dayjs(s.close).format('HH:mm')
		}
	})

	function addSchedule() {
		if (scheduleIn.length == 0) {
			scheduleIn = [...scheduleIn, {
				day: dayjs().format('YYYY-MM-DD'),
				open: dayjs().hour(8).minute(0).format('HH:mm'),
				close: dayjs().hour(18).minute(0).format('HH:mm')
			}]			
		}else{
			let last = scheduleIn[scheduleIn.length -1]
			scheduleIn = [...scheduleIn, {
				day: dayjs(last.day).add(1, 'day').format('YYYY-MM-DD'),
				open: last.open,
				close: last.close
			}]
		}
		convertSchedule()
	}

	function removeSchedule(i) {
		scheduleIn.splice(i, 1)
		scheduleIn = scheduleIn
		convertSchedule()
	}

	function convertSchedule() {
		schedule = scheduleIn.map(s => {
			if (s.day && s.open && s.close) {
				let dayForSafari = dayjs(s.day).format('YYYY/MM/DD')
				return {
					open: new Date(`${dayForSafari} ${s.open}`).toISOString(),
					close: new Date(`${dayForSafari} ${s.close}`).toISOString()
				}			
			}
		})
	}
	
	let invalid = ''
	$: {
		invalid = ''
		if (!name) invalid = 'Pas de nom'
		else if (!address) invalid = 'Adresse incomplette'
		else if (!location.lat) invalid =  'Adresse non localisé'
		else if (description.length < 10) invalid = 'Déscription trop courte'
		else if (!scheduleIn.length) invalid = 'Pas de plage horaire'
		else if (schedule.indexOf(undefined) != -1) invalid = 'Plage horaire incomplette'
	}

	function create() {
		if (!invalid) {

			fetch(`/trocs`, getHeader({name, address, location, description, schedule, society, societyweb}))
			.then(res => res.json())
			.then(json => updateTroc(json, () => {
				$me.creditTroc--
				dispatch('create')
			}))

		}
	}

	//For SearchLocation to Autopatch
	//Très bof bof, mais ca marche
	let changeFlag = false 

</script>

{#if !createMode}
	<AutoPatch 	source="editForm"
				path="{`/trocs/${_id}`}"
				invalid={invalid}
				body="{{name, address, location, description, schedule, society, societyweb}}"
				trocRefresh
				bind:changeFlag={changeFlag}/>

	<!-- Il faudra gerer les mise a jour de l'image en plus !!! -->
{/if}

<form id="editForm" name="editForm" class="w3-center" enctype="multipart/form-data">
	<br>
	<h3>Mon troc</h3>
	<input bind:value={name} class="w3-input w3-large" type="text" placeholder="Nom de l'évènement">
	<textarea bind:value={description} class="w3-round" placeholder="Description" rows="6"></textarea>

	<br>
	<br>
	<h3>Lieu</h3>
	<SearchAddress 	bind:address={address}
					bind:location={location}
					bind:changeFlag={changeFlag}/>

	<br>
	<br>
	<h3>Horaire</h3>
	{#each scheduleIn as {day, open, close}, i}
		<div in:slide class="schedule w3-margin-top w3-border w3-round w3-padding">

			<input 	bind:value={day}
					type="date"
					class="w3-input"
					on:input={convertSchedule}>
			
			<div class="w3-row">
				<div class="w3-col m5">
					Ouverture
					<input 	bind:value={open}
							type="time"
							max={close}
							class="w3-padding w3-round"
							on:input={convertSchedule}>	
				</div>
				<div class="w3-col m5">
					Fermeture
					<input 	bind:value={close}
							type="time"
							min={open}
							class="w3-padding"
							on:input={convertSchedule}>
				</div>
				<i 	on:click="{() => removeSchedule(i)}"
					class="patchButton fa fa-times w3-col m1 w3-right w3-large w3-padding"></i>	
			</div>			
		</div>
	{/each}
	<div on:click={addSchedule}
		 class="patchButton w3-button w3-border w3-round w3-right">
		+1 jour
	</div>

	<br>
	<br>
	<h3>Mon organisation <span class="w3-small w3-opacity">Pas obligatoire</span></h3>
	<input bind:value={society} class="w3-input" type="text" placeholder="Nom">
	<input bind:value={societyweb} class="w3-input" type="text" placeholder="Site internet">

	{#if createMode}
		<br>
		<div on:click={create} 
			class:w3-disabled={!!invalid} 
			class="w3-button w3-border w3-round">
			Créer mon troc
		</div>
	{/if}
	
</form>

<style>
	form {
		max-width: 600px;
		margin: auto;
	}

	input[type=time] {
		border: none;
	}

	h3 {
		border-bottom: 2px solid #d6d6d6;
	}

	.schedule i {
		transform: scale(0);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.schedule:hover i {
		transform: scale(1);
	}

	.schedule i:hover {
		transform:scale(1.2);
		color: red;
	}

	.w3-button {
		margin-top: 10px;
	}
</style>