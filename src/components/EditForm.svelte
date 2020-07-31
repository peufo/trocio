<script>
	
	import { onMount } from 'svelte'
	import { slide } from 'svelte/transition'
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()
	import dayjs from 'dayjs'
	import TextField from '@smui/textfield'
	import Button, { Label } from '@smui/button'
	import DataTable, {Head, Body, Row, Cell} from '@smui/data-table'

	import { troc } from './stores'
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
	export let mapDelay = 0
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
				user.creditTroc--
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

<form id="editForm" name="editForm" enctype="multipart/form-data" bind:offsetWidth>
	<div class="container" class:smallDisplay>
		<div class="item troc">
			<h4>Mon troc</h4><br>
			<TextField bind:value={name} label="Nom de l'évènement" variant="outlined" style="width: 100%;"/>
			<br><br>
			<TextField bind:value={description} label="Déscription" fullwidth textarea style="min-height: 168px;"/>
		</div>

		<div class="item location">
			<h4>Lieu</h4><br>
			<SearchAddress 	{mapDelay}
							bind:address={address}
							bind:location={location}
							bind:changeFlag={changeFlag}/>
		</div>


		<div class="item schedule">
			<h4>Horaire</h4><br>
			<DataTable class="w3-margin-bottom" style="min-width: 100%;">
				<Head>
					<Row>
						<Cell>Date</Cell>
						<Cell>Ouverture</Cell>
						<Cell>Fermeture</Cell>
						<Cell style="width: 20px;"></Cell>
					</Row>
				</Head>
				<Body >
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
		
		</div>
	
		<div class="item society">
			<h4>Mon organisation <span class="w3-small w3-opacity">Pas obligatoire</span></h4><br>
			<TextField bind:value={society} label="Nom de l'organisation" variant="outlined" style="width: 100%;"/><br><br>
			<TextField bind:value={societyweb} label="Site internet de l'organisation" variant="outlined" style="width: 100%;"/>
		</div>

	</div>
	
	{#if createMode}
		<!--
			<div on:click={create} 
				class:w3-disabled={!!invalid} 
				class="w3-button w3-border w3-round">
				Créer mon troc
			</div>
		-->
		<div style="margin-top: 40px;">
			<Button variant="raised" class="w3-right" title="Valider la création de mon troc">
				<Label>Créer mon troc</Label>
			</Button>
		</div>
		<br><br>
	{/if}
	
</form>

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
