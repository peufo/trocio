<script>
	import { me } from './stores'
	import Resume from './Resume.svelte'
	import Toggle from './Toggle.svelte'
	import Slider from './Slider.svelte'
	import { onMount } from 'svelte'
	import { slide } from 'svelte/transition'
	import L from 'leaflet'
	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'
	dayjs.locale('fr')
	dayjs.extend(relativeTime)


	let map,
		trocs = [],
		markers = [],
		mapOpen = true,
		mapFilter = true,
		timeOpen = false,
		timeFilter = true,
		search = '',
		start = '', 
		stop = ''


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
			waiting = setTimeout(() => loadTrocs(e), 200)
		}
	}
	function newSearch() {
		clearTimeout(waiting)
		waiting = setTimeout(() => loadTrocs(e), 200)
	}

	function loadTrocs() {

		let query = `/trocs/search?search=${search}`

		if (timeFilter) {
			query += `&start=${start}&stop=${stop}`
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
			markers.forEach(m => m.remove())
			if (json.length) markers = json.map(j => L.marker(j.location).addTo(map).bindTooltip(j.name))
		})
	}

	$: console.log($me)

</script>


<div id="container" class="w3-padding">

	<div class="w3-row">

		<div class="w3-col m8">
			<input 	bind:value={search}
					on:input={newSearch}
					class="w3-input w3-large"
					type="search"
					placeholder="Recherche d'un troc">		
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
		<div class="w3-margin w3-center w3-row" transition:slide>
			<div class="w3-col m5">
				<input type="date" class="w3-input">
			</div>
			<div class="w3-col m2">
				<i class="fas fa-arrow-right w3-large w3-margin-top"></i>
			</div>
			<div class="w3-col m5">
				<input type="date" class="w3-input">
			</div>
		</div>
	{/if}

	<div id="map" class="show" class:hide={!mapOpen}></div>
	


	<div>
		{#each trocs as t (t._id)}
			<div transition:slide class="card w3-margin-top w3-padding w3-display-container">
				<span class="w3-large">{t.name}</span>
				<i>{t.society}</i>
				
				<div class="w3-small w3-right">
					<span class="w3-right w3-round" on:click="{() => t.scheduleOpen = true}">
						<i class="far fa-clock"></i>
						{dayjs(t.schedule[0].open).fromNow()}
					</span>

					{#if t.scheduleOpen}
						<ul class="w3-ul w3-tiny w3-margin-top">
						{#each t.schedule as day}
							<li>
								{dayjs(day.open).format('ddd. DD.MM.YY [d]e H[h]mm à ')}
								{dayjs(day.close).format('H[h]mm')}
							</li>
						{/each}
						</ul>
					{/if}
					
				</div>
				<br>
				<span class="w3-small">
					<i class="fas fa-map-marker-alt"></i>
					{t.address}
				</span>

				<p>{t.description}</p>
				<span class="w3-small">350 articles proposés</span><br>
	
				<div class="w3-display-bottomright">

					{#if $me.trocs && $me.trocs.map(tr => tr._id).indexOf(t._id) != -1}
				
						{#if t.resumeOpen}
							
							RESUME
						{:else}
							2 achats, 3 ventes
						{/if}

					{:else}
						Participer
					{/if}

				</div>
			
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


<svelt:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css">
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


	.card {
		box-shadow: 0px 0px 10px rgba(78, 78, 78, 0.2);
		transition: .2s ease all;
		border-radius: 4px;
	}

	.card:hover {
		box-shadow: 0px 0px 10px rgba(78, 78, 78, 0.35);
	}
	
	@media screen and (max-width: 600px) {
		.fa-arrow-right {transform: rotate(90deg);}
	}

</style>