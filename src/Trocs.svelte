<script>
	import { me } from './stores'
	import Button from '@smui/button'
	import Resume from './Resume.svelte'
	import Articles from './Articles.svelte'
	import Toggle from './Toggle.svelte'
	import Login from './Login.svelte'
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
		timeFilter = false,
		search = '',
		start = dayjs().format('YYYY-MM-DD'), 
		end = ''

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

</script>

<div id="vue">
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
		
		
		<div> <!-- Liste des trocs-->
			{#each trocs as troc, i (troc._id)}
				
				<!--  En-tête  -->
				<div transition:slide class="card">

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

						<div class="w3-col m4 w3-center schedule">
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
					
					<!-- Onglets -->
					<div class="onglets w3-border-top">
						
						<div class="w3-padding underline-div onglet" on:click="{() => troc.tabSelect = 0}" class:actived="{troc.tabSelect == 0}">
							<span class="underline-span">Fouiller les articles ({troc.articlelastref})</span>
						</div>

						<div class="w3-padding underline-div onglet" on:click="{() => troc.tabSelect = 1}" class:actived="{troc.tabSelect == 1}">
							<span class="underline-span">Voir mon activité</span>
						</div>

						<!--Access butons icon-->
						{#if troc.isAdmin}
							<div class="w3-right w3-padding button-icon w3-center">
								<a href="{`/admin/${troc._id}`}">
									<i class="fa fa-cog w3-large"></i>
								</a>
							</div>
						{:else if troc.isCashier}
							<div class="w3-right w3-padding button-icon w3-center">
								<a href="{`/cashier/${troc._id}`}">
									<i class="fa fa-cash-register w3-large"></i>
								</a>
							</div>							
						{/if}						
					</div>


					<!-- Contenu des onglets -->
					{#if troc.tabSelect > -1}

						<div class="tabs" transition:slide style="height: 500px;">

							<!-- Liste d'articles -->
							<div class="tab" class:center={troc.tabSelect === 0} class:left={troc.tabSelect > 0}>
								<Articles troc={troc._id}/>
							</div>

							<!-- Resume -->
							<div class="tab w3-padding-large" class:center={troc.tabSelect === 1} class:right={troc.tabSelect < 1}>
								<br>
								{#if $me._id}
									<Resume userId={$me._id} trocId={troc._id}/>
								{:else}
									<br>
									<div style="width: 400px; margin: auto;">
										<Login id="{i}"/>
									</div>
									<br>
								{/if}					
							</div>
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
</div>

<svelt:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css">
	<style>#waitLoaded { display: none; }</style>
</svelt:head>

<style>

	#vue {
		height: calc(100% - 58px);
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

	.schedule {
		background: rgb(252, 252, 252);
	}

</style>