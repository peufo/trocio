<script>
	import { onMount } from 'svelte'
	import { slide } from 'svelte/transition'
	import { me } from './stores'

	import Button from '@smui/button'
	import Dialog, {Title, Content} from '@smui/dialog'
	import Textfield from '@smui/textfield'

	import L from 'leaflet'
	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'

	import Resume from './Resume.svelte'
	import Articles from './Articles.svelte'
	import Toggle from './Toggle.svelte'
	import Login from './Login.svelte'
	
	dayjs.locale('fr')
	dayjs.extend(relativeTime)

	let map,
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
	let dialogLogin, dialogArticles, dialogResume

	let icon = L.icon({
		iconUrl:'images/marker-icon.png',
		iconRetinaUrl: 'images/marker-icon-2x.png',
		iconSize: [28, 42],
		iconAnchor: [14, 42],
		tooltipAnchor: [14, -30],
	})

	let tabs = [
		{id: 0, name: 'Voir les articles fournis', icon: '<i class="fas fa-sign-in-alt"></i>'},
		{id: 2, name: 'Récupère', icon: '<i class="fas fa-sign-out-alt"></i>'}
	]

	onMount(() => {
		map = L.map('map', {
		    center: [47.4013048812248, 7.076493501663209],
			zoom: 6,
			watch: true
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

	//$: $me._id && loadTrocs() //DANGEREUX, ENGENDRE UNE DOUBLE REQUETE QUAND ON EST LOGE ET SERT QU'AU LOGIN (RAFR ISADMIN ET ISCASHIER)

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

	function clickActivity() {
		if ($me._id) {
			dialogResume = true
		}else{
			dialogLogin.open()
		}
	}

	function loginClose() {
		dialogLogin.close()
		setTimeout(() => clickActivity(), 100)
	}

</script>


<div id="vue">
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
			
			<!--  En-tête  -->
			<div transition:slide|local class="card" on:click="{() => {trocSelected = troc._id; trocSelectedName = troc.name}}">

				<div class="w3-row">
					<div class="w3-col m8 w3-padding">
						<span class="w3-large">{troc.name}</span>
						<a href={troc.societyweb ? `https://${troc.societyweb}` : ''}>
							<i>{troc.society}</i>
						</a>
						<br>
						<span class="w3-small">
							<i class="fas fa-map-marker-alt"></i>
							{troc.address}
						</span>
						<p>{troc.description}</p>
						
						<Button href={`https://${troc.societyweb}`} dense color="secondary">
							<i class="fas fa-globe"></i>&nbsp;{troc.societyweb}
						</Button>
						
					</div>

					<div class="w3-col m4 w3-center">
						<div class="w3-small w3-padding">
							<span class="w3-round">
								<i class="far fa-clock"></i>
								{dayjs(troc.schedule[0].open).fromNow()}
							</span>

							<ul class="w3-ul w3-tiny w3-margin-top">
							{#each troc.schedule as day}
								<li>
									{dayjs(day.open).format('ddd. DD.MM.YY [d]e H[h]mm à ')}
									{dayjs(day.close).format('H[h]mm')}
								</li>
							{/each}
							</ul>
							
						</div>
					</div>
				</div>
				
				<!-- Button -->
				<div class="w3-center w3-padding">
					<Button
					on:click="{() => dialogArticles.open()}"
					color="secondary" variant="outlined" style="margin-top: 5px;">
						Fouiller les articles ({troc.articlelastref})
					</Button>

					<Button
					on:click="{clickActivity}"
					color="secondary" variant="outlined" style="margin-top: 5px;">
						Voir mon activité
					</Button>

					{#if troc.isAdmin}
						<Button href="{`/admin/${troc._id}`}" color="secondary" variant="outlined" style="margin-top: 5px;">
							<i class="fa fa-cog w3-large"></i>
						</Button>
					{:else if troc.isCashier}
						<Button href="{`/cashier/${troc._id}`}" color="secondary" variant="outlined" style="margin-top: 5px;">
							<i class="fa fa-cash-register w3-large"></i>
						</Button>
					{/if}

				</div>

				{#if $me._id && dialogResume && trocSelected === troc._id}
					<div class="w3-padding">
						<Resume userId={$me._id} trocId={troc._id}/>
					</div>
				{/if}

			</div>


		{:else}
			<br>
			<span class="w3-large">
				Aucun troc ne correspond à la recherche
				<i class="far fa-tired"></i>
			</span>
		{/each}
	
	</div>
</div>

<!-- Dialogs -->

<Dialog bind:this={dialogLogin}>
	<Content>
		<Login on:close={loginClose}/>
	</Content>
</Dialog>

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

	#vue {
		height: calc(100% - 56px);
		overflow-y: auto;
	}

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

	.card {
		box-shadow: 0px 0px 10px rgba(78, 78, 78, 0.2);
		transition: .2s ease all;
		border-radius: 4px;
		margin-top: 30px;
		margin-bottom: 30px;
		overflow-x: auto;
	}

	.card:hover {
		box-shadow: 0px 0px 10px rgba(78, 78, 78, 0.35);
	}

	.card:last-child {
		margin-bottom: 80px;
	}
	
	@media screen and (max-width: 600px) {
		.fa-arrow-right {transform: rotate(90deg);}
	}

</style>