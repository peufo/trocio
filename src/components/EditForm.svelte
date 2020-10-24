<script>
	
	import { onMount } from 'svelte'
	import { slide } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import dayjs from 'dayjs'
	import TextField from '@smui/textfield'
	import Button, { Label } from '@smui/button'
	import DataTable, {Head, Body, Row, Cell} from '@smui/data-table'

	import notify from 'notify.js'
	import { troc, user } from './stores'
	import { getHeader } from './utils'
	import AutoPatch from './AutoPatch.svelte'
	import SearchAddress from './SearchAddress.svelte'

	export let _id = ''
	export let name = ''
	export let address = ''
	export let location = {}
	export let description = ''
	export let schedule = []
	export let society = ''
	export let societyweb = ''
	export let mapDelay = 0

	let createPromise

	let offsetWidth = 0
	let smallDisplay = false

	$: smallDisplay = offsetWidth < 800

	//Schedule conversion
	if (!schedule.length) onMount(addSchedule)
	let scheduleIn = schedule.map(s => {
		return {
			day: 	dayjs(s.open).format('YYYY-MM-DD'),
			open: 	dayjs(s.open).format('HH:mm'),
			close: 	dayjs(s.close).format('HH:mm')
		}
	})

	function addSchedule(e) {
		if (!!e) e.preventDefault()
		if (scheduleIn.length == 0) {
			scheduleIn = [...scheduleIn, {
				day: dayjs().add(7, 'day').format('YYYY-MM-DD'),
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
		else if (description.length < 10) invalid = `Déscription trop courte (${description.length}/10)`
		else if (!scheduleIn.length) invalid = 'Pas de plage horaire'
		else if (schedule.indexOf(undefined) != -1) invalid = 'Plage horaire incomplette'
	}

	async function create(is_try = false) {
		if (invalid) return notify.warning(invalid)
		try {
			let res = await fetch(`__API__/trocs`, getHeader({name, address, location, description, schedule, society, societyweb, is_try}))
			let json = await res.json()
			if (json.error) return notify.error(json.message)
			notify.success('Nouveau troc créer !')
			$user.creditTroc--
			dispatch('create', json.message)
		} catch(error) {
			console.trace(error)
		}

	}

	function createPublic(event) {
		if (event.isTrusted) createPromise = create()
	}

	function createTry(event) {
		if (event.isTrusted) createPromise = create(true)
	}

	//For SearchLocation to Autopatch
	//Très bof bof, mais ca marche
	let changeFlag = false 

</script>

<div id="editForm" bind:offsetWidth>
	<div class="container" class:smallDisplay>
		<div class="item troc">
			<h4>Mon troc</h4><br>
			<TextField bind:value={name} label="Nom de l'évènement" variant="outlined" style="width: 100%;"/>
			<br><br>
			<TextField bind:value={description} label="Déscription" fullwidth textarea style="min-height: 168px;"/>
		</div>

		<div class="item location">
			<h4>Lieu</h4><br>
			{#if $troc && $troc.is_try}
				<span class="w3-opactiy w3-text-orange">Les trocs d'entrainements n'ont pas de lieu.</span>
			{:else}
				<SearchAddress 	{mapDelay}
								bind:address={address}
								bind:location={location}
								bind:changeFlag={changeFlag}/>
			{/if}
		</div>

		<div class="item schedule">
			<h4>Horaire</h4><br>
			{#if $troc && $troc.is_try}
				<span class="w3-opactiy w3-text-orange">Les trocs d'entrainements n'ont pas d'horaire.</span>
			{:else}
				<DataTable class="w3-margin-bottom" style="min-width: 100%;">
					<Head>
						<Row>
							<Cell>Date</Cell>
							<Cell>Ouverture</Cell>
							<Cell>Fermeture</Cell>
							<Cell style="width: 20px;"></Cell>
						</Row>
					</Head>
					<Body>
						{#each scheduleIn as {day, open, close}, i}
							<Row>
								<Cell><input bind:value={day} type="date" /></Cell>
								<Cell><input bind:value={open} max={close} on:input={convertSchedule} type="time" /></Cell>
								<Cell style="width: 20px; padding: 1px 0px 1px 16px">
									<input bind:value={close} min={open} on:input={convertSchedule} type="time" />
								</Cell>
								<Cell style="width: 20px; padding: 0px">
									<i 	on:click="{() => removeSchedule(i)}"
										class="patchButton far fa-trash-alt w3-right w3-large w3-padding"
										title="supprimer la période">
									</i>
								</Cell>	
							</Row>
						{/each}				
					</Body>
				</DataTable>
				
				<Button on:click={addSchedule} variant="outlined" color="secondary" class="patchButton w3-right" title="Ajouter un période">
					<Label>+1 période</Label>
				</Button>

				<br>
				<span class="w3-opacity w3-text-orange">
					L'horaire n'est plus modifiable une fois que l'évenement a débuté.
				</span>
			{/if}

		</div>
	
		<div class="item society">
			<h4>Mon organisation <span class="w3-small w3-opacity">Pas obligatoire</span></h4><br>
			<TextField bind:value={society} label="Nom de l'organisation" variant="outlined" style="width: 100%;"/><br><br>
			<TextField bind:value={societyweb} label="Site internet de l'organisation" variant="outlined" style="width: 100%;"/>
		</div>

		

	</div>
	
	{#if !$troc}
		<div style="margin-top: 40px;">
			{#await createPromise}
				<Button>Création en cours...</Button>
			{:then}
				<Button on:click={createPublic} variant="raised" class="w3-right" title="Valider la création de mon troc">
					<Label>Créer un troc public</Label>
				</Button>

				<Button on:click={createTry} variant="outlined" class="w3-right w3-margin-right" title="Valider la création de mon troc">
					<Label>Créer un troc d'entrainement</Label>
				</Button>

			{/await}
		</div>
		<br><br>
	{:else}

		<AutoPatch 	
			source="editForm"
			path={`/trocs/${_id}`}
			invalid={invalid}
			body={{name, address, location, description, schedule, society, societyweb}}
			trocRefresh
			bind:changeFlag={changeFlag}/>
	{/if}
	
</div>

<style>

	.container {
		display: grid;
		width: 100%;
		grid-template-columns: minmax(50%, 500px)  minmax(25%, 50%);
		gap: 2rem;
	}

	.container.smallDisplay {
		grid-template-columns: 100%;
	}

	.schedule input {
		border: none;
		font-size: medium;
		padding: 5px 10px;
		background: rgba(0, 0, 0, 0)
	}

	.schedule i {
		transform: scale(0);
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.schedule tr:hover i {
		transform: scale(1);
	}

</style>
