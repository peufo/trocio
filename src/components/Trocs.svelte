<script>
	import { onMount } from 'svelte'
	import { slide } from 'svelte/transition'

	import Button from '@smui/button'
	import IconButton, {Icon} from '@smui/icon-button'
	import Dialog, {Title, Content} from '@smui/dialog'
	import Textfield from '@smui/textfield'
	import Card, {Content as ContentCard, Actions, ActionButtons, ActionIcons} from '@smui/card'

	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
	dayjs.extend(relativeTime)

	import TrocInfo from './TrocInfo.svelte'
	import Articles from './Articles.svelte'
	import Toggle from './Toggle.svelte'

	let L,
		map,
		icon,
		trocs = [],
		trocSelected = '',
		trocSelectedName = '',
		markers = [],
		mapOpen = true,
		mapFilter = true,
		timeOpen = false,
		timeFilter = false,
		search = '',
		start = dayjs().format('YYYY-MM-DD'), 
		end = ''

	//Dialogs
	let dialogArticles

	let tabs = [
		{id: 0, name: 'Voir les articles fournis', icon: '<i class="fas fa-sign-in-alt"></i>'},
		{id: 2, name: 'Récupère', icon: '<i class="fas fa-sign-out-alt"></i>'}
	]

	onMount(async () => {

		const leafletModule = await import('leaflet')
		L = leafletModule.default

		map = L.map('map', {
		    center: [47.4013048812248, 7.076493501663209],
			zoom: 6,
			watch: true
		})

		icon = L.icon({
			iconUrl:'images/marker-icon.png',
			iconRetinaUrl: 'images/marker-icon-2x.png',
			iconSize: [28, 42],
			iconAnchor: [14, 42],
			tooltipAnchor: [14, -30],
		})

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map)

		map.on('move', onMapMove)

		loadTrocs()

	})

	//Events which update
	let waiting
	function onMapMove() {
		if (mapFilter) {
			clearTimeout(waiting)
			waiting = setTimeout(() => loadTrocs(), 200)
		}
	}
	function newSearch() {
		clearTimeout(waiting)
		waiting = setTimeout(() => loadTrocs(), 200)
	}

	function loadTrocs() {
		let query = `/trocs/search?search=${search}`

		if (timeFilter) {
			if (start) query += `&start=${start}`
			if (end) query += `&end=${end}`
		}

		if (mapFilter) {
			let sw = map.getBounds()._southWest
			let ne = map.getBounds()._northEast
			query += `&north=${ne.lat}&east=${ne.lng}&sud=${sw.lat}&west=${sw.lng}`
		}

		fetch(query)
		.then(res => res.json())
		.then(json => {
			trocs = json

			//Period
			trocs.forEach(troc => {
				let dates = troc.schedule.map(s => new Date(s.open).getTime()).sort((a, b) => a - b)
				troc.start = new Date(dates[0]).toJSON()
				troc.end = new Date(dates[dates.length - 1]).toJSON()
			})

			//Map
			markers.forEach(m => m.remove())
			if (trocs.length) markers = trocs.map(j => L.marker(j.location, {icon}).addTo(map).bindTooltip(j.name))

		})
	}

</script>

<div id="container" class="w3-padding">

	<div class="w3-row">

		<div class="w3-col m8">
			<Textfield
			style="width: 100%;"
			bind:value={search}
			on:input={newSearch}
			type="search"
			label="Recherche"
			></Textfield>	
		</div>

		<div class="w3-col m4">
			<div class="w3-round w3-right w3-margin-left">
				<div class="w3-left">
					<Toggle bind:value={mapFilter} on:click="{() => {loadTrocs(); if (mapFilter) mapOpen = true}}"/>
				</div>
				<div class="w3-button" on:click="{() => mapOpen = !mapOpen}">
					<i class="fas fa-globe-europe w3-large"></i>
					<i class="fas fa-angle-right w3-large" class:open={mapOpen}></i>
				</div>
			</div>

			<div class="w3-round w3-right">

				<div class="w3-left">
					<Toggle bind:value={timeFilter} on:click={loadTrocs}/>
				</div>

				<div class="w3-button" on:click="{() => timeOpen = !timeOpen}">
					<i class="far fa-clock w3-large"></i>
					<i class="fas fa-angle-right w3-large" class:open={timeOpen}></i>
				</div>
			</div>
		</div>
	</div>

	{#if timeOpen}
		<div class="w3-margin w3-center w3-row" transition:slide|local>
			<div class="w3-col m5">
				<input on:input={loadTrocs} bind:value={start} type="date" class="w3-input">
			</div>
			<div class="w3-col m2">
				<i class="fas fa-arrow-right w3-large w3-margin-top"></i>
			</div>
			<div class="w3-col m5">
				<input on:input={loadTrocs} bind:value={end} type="date" class="w3-input">
			</div>
		</div>
	{/if}

	<div id="map" class="show" class:hide={!mapOpen}></div>
	
	
	{#each trocs as troc, i (troc._id)}
		<div transition:slide|local class="w3-margin-top">
			<Card>
				<ContentCard>
					<TrocInfo {troc} societyDisplay />
				</ContentCard>
				<Actions>
					<ActionButtons>
						<Button
						on:click="{() => dialogArticles.open()}"
						color="secondary" style="margin-top: 5px;">
							Fouiller les articles ({troc.articlelastref})
						</Button>

						<Button
						href={`/activity/detail?troc=${troc._id}`}
						title="Afficher vos activités"
						color="secondary" style="margin-top: 5px;">
							Activités
						</Button>
					</ActionButtons>
					<ActionIcons>
						{#if troc.isAdmin}
							<IconButton href={`/admin?troc=${troc._id}`} title="Accéder à la page d'administration">
								<Icon class="fas fa-cog" style="transform: translate(0.5px, -5px);"></Icon>
							</IconButton>
						{:else if troc.isCashier}
							<IconButton href={`/cashier?troc=${troc._id}`} title="Accéder à la caisse">
								<Icon class="fa fa-cash-register" style="transform: translate(0.5px, -5px);"></Icon>
							</IconButton>
						{/if}
					</ActionIcons>
				</Actions>
			</Card>
		</div>
		

	{:else}
		<br>
		<span class="w3-large">
			Aucun troc ne correspond à la recherche
			<i class="far fa-tired"></i>
		</span>
	{/each}

</div>


<!-- Dialogs -->
<Dialog bind:this={dialogArticles} style="min-height: 430px;">
	<Title>Fouiller les articles dans <i>{trocSelectedName}</i></Title>
	<Content>
		<Articles troc={trocSelected}/>
	</Content>
</Dialog>

<svelt:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css">
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>

	#container {
		max-width: 850px;
		margin: auto;
	}

	#map {
		height: 300px;
		border-radius: 5px;
		z-index: 0;
	}

	.show {
		overflow: hidden;
		transition: 0.4s;
	}

	.hide {
		height: 0px !important;
	}

	.fa-angle-right {
		transition: all .2s ease;
	}

	.open {
		transform: rotate(90deg);
	}
	
	@media screen and (max-width: 600px) {
		.fa-arrow-right {transform: rotate(90deg);}
	}

</style>