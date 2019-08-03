<script>
	import { me } from './stores'
	import Resume from './Resume.svelte'
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

		console.log(start)

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
			trocs.forEach(t => {
				let dates = t.schedule.map(s => new Date(s.open).getTime()).sort((a, b) => a - b)
				t.start = new Date(dates[0]).toJSON()
				t.end = new Date(dates[dates.length - 1]).toJSON()
			})

			//Map
			markers.forEach(m => m.remove())
			if (trocs.length) markers = trocs.map(j => L.marker(j.location).addTo(map).bindTooltip(j.name))

		})
	}

	$: {
		if ($me.trocs) {
			trocs.forEach(t => {
				let index = $me.trocs.map(tr => tr._id).indexOf(t._id)
				t.activity = index != -1
				if (t.activity) {
					t.isCashier = $me.trocs[index].cashier
					t.isAdmin = $me.trocs[index].admin
				}
			})
		}
	}

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
		{#each trocs as t, i (t._id)}
			
			<!--  En-tête  -->
			<div on:mouseenter="{() => t.hover = true}"
				 on:mouseleave="{() => t.hover = false}"
				 transition:slide 
				 class="card w3-margin-top">
				<div class="w3-row">
					<div class="w3-col m8 w3-padding">
						<span class="w3-large">{t.name}</span>
						<i>{t.society}</i>
						<br>
						<span class="w3-small">
							<i class="fas fa-map-marker-alt"></i>
							{t.address}
						</span>
						<p>{t.description}</p>
						
					</div>

					<div class="w3-col m4 w3-center schedule">
						<div class="w3-small w3-padding">
							<span class="w3-round">
								<i class="far fa-clock"></i>
								{dayjs(t.schedule[0].open).fromNow()}
							</span>

							{#if t.hover}
								<ul class="w3-ul w3-tiny w3-margin-top" in:slide="{{delay: 400}}" out:slide>
								{#each t.schedule as day}
									<li>
										{dayjs(day.open).format('ddd. DD.MM.YY [d]e H[h]mm à ')}
										{dayjs(day.close).format('H[h]mm')}
									</li>
								{/each}
								</ul>
							{/if}
						</div>
					</div>
				</div>
				
				<!-- Boutons -->
				<div class="w3-row w3-border-top onglets">

					<div class="w3-col w3-center w3-padding underline-div onglet"
						 class:s5="{t.isAdmin || t.isCashier}"
						 class:s6="{!t.isAdmin && !t.isCashier}"
						 class:actived="{t.ongletOpen == 0}"
						 on:click="{() => t.ongletOpen = 0}">
						<span class="underline-span">Voir les 350 articles</span>
					</div>

					<div class="w3-col s5 w3-center w3-padding underline-div onglet"
						 class:s5="{t.isAdmin || t.isCashier}"
						 class:s6="{!t.isAdmin && !t.isCashier}"
						 class:actived={t.ongletOpen == 1}
						 on:click="{() => t.ongletOpen = 1}">

						{#if t.activity}
							<span class="underline-span">Proposer un article</span>
						{:else}
							<span class="underline-span">Voir mon activité</span>
						{/if}

					</div>

					<!--Bontons icon-->
					{#if t.isAdmin || t.isCashier}
						<div class="w3-col s1 w3-padding button-icon w3-center">
							<i class="fa fa-cash-register w3-large"></i>
						</div>
					{/if}

					{#if t.isAdmin}
						<div class="w3-col s1 w3-padding button-icon w3-center">
							<i class="fa fa-cog w3-large"></i>
						</div>
					{/if}

				</div>

				<!-- Contenu supplementaire-->
				{#if t.ongletOpen === 0}
					Liste des articles
				{/if}
				<!-- :else if beugue... -->
				{#if t.ongletOpen === 1}
					<div transition:slide>
						{#if $me._id}
							<Resume userId={$me._id} trocId={t._id}/>
						{:else}
						<br>
						<div class="w3-padding" style="width: 400px; margin: auto;">
							<Login id="{i}"/>
						</div>
						<br>
						{/if}
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

	.card:last-child {
		margin-bottom: 80px;
	}
	
	@media screen and (max-width: 600px) {
		.fa-arrow-right {transform: rotate(90deg);}
	}

	.schedule {
		background: #efefef;
		border-radius: 0px 0px 0px 4px;
	}

	.underline-div {
		cursor: pointer;
	}

	.underline-div:hover .underline-span {
		background-size: 100% 100%;
	}
	.underline-span {
		background: linear-gradient(to top, rgb(150, 150, 150) 0%, rgb(150, 150, 150) 1px, transparent 2px) no-repeat;
		background-size: 0% 100%;
		transition: background-size .15s;
	}

	.onglets {
		background: rgb(245, 245, 245);
	}

	.onglet {
		background: rgb(245, 245, 245);
		border-radius: 10px 10px 0px 0px;
		border: 1px rgb(100, 100, 100);
	}

	.onglet.actived {
		background: white;
	}

	.button-icon {
		cursor: pointer;
		transition: all 0.3s;
	}

	.button-icon:hover {
		transform: scale(1.2);
	}

</style>