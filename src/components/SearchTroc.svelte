<script>
	import { goto } from '@roxi/routify'
	import { onMount } from 'svelte'
	import { flip } from 'svelte/animate'
    import { crossfade, fade } from 'svelte/transition'

	import { Dialog, Card, TextField, Switch, Icon } from 'svelte-materialify'

	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'

	import L from 'leaflet'

	import { user, subscribedTrocs } from './stores.js'
	import { getHeader, crossfadeConfig } from './utils.js'
	import notify from './notify.js'
	import TrocInfo from './TrocInfo.svelte'
	import Resume 	from './Resume.svelte'
	import Articles from './Articles.svelte'
	
	export let mapDelay = 0 // Pour attendre la fin de l'animation

	dayjs.locale('fr')
	dayjs.extend(relativeTime)

	const [send, receive] = crossfade(crossfadeConfig)

	let map,
		icon,
		trocs = [],
		trocSelected = '',
		trocSelectedName = '',
		markers = [],
		mapFilter = true,
		timeFilter = true,
		search = '',
		start = dayjs().format('YYYY-MM-DD'), 
		end = dayjs().add(6, 'month').format('YYYY-MM-DD'),
		limitTrocsDisplay = 3,
		scrollY = 0,
		innerHeight

	//Dialogs
	let dialogArticles

	$: if(scrollY && scrollY + innerHeight > document.body.offsetHeight - 50 ) {
		limitTrocsDisplay++
		if (limitTrocsDisplay === trocs.length) loadTrocs(trocs.length)
	}

	onMount(() => {
		setTimeout(() => {

			map = L.map('map', {
				center: [47.4013048812248, 7.076493501663209],
				zoom: 6,
				watch: true
			})
	
			icon = L.icon({
				iconUrl:'/images/marker-icon.png',
				iconRetinaUrl: '/images/marker-icon-2x.png',
				iconSize: [28, 42],
				iconAnchor: [14, 42],
				tooltipAnchor: [14, -30],
			})
	
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			}).addTo(map)
	
			map.on('move', () => mapFilter && newSearch())
	
			loadTrocs()

		}, mapDelay)

	})

	//Events which update
	let waiting

	function newSearch() {
		console.log('new search')
		clearTimeout(waiting)
		waiting = setTimeout(() => loadTrocs(), 200)
	}

	async function loadTrocs(skip = 0) {
		let query = `/__API__/trocs/search?search=${search}&skip=${skip}`

		if (timeFilter) {
			if (start) query += `&start=${start}`
			if (end) query += `&end=${end}`
		}

		if (mapFilter) {
			let sw = map.getBounds()._southWest
			let ne = map.getBounds()._northEast
			query += `&north=${ne.lat}&east=${ne.lng}&sud=${sw.lat}&west=${sw.lng}`
		}

		try {
			const json = await fetch(query).then(res => res.json())
			if (json.error) throw json.message
			limitTrocsDisplay = skip + 3

			let up = skip ? trocs[trocs.length - 1].up : new Date().getTime()
			let newTrocs =  json.map(troc =>  {return {...troc, up}})
			trocs = skip ? [...trocs, ...newTrocs] : newTrocs
			

			//Format les période
			trocs.forEach(troc => {
				let dates = troc.schedule.map(s => new Date(s.open).getTime()).sort((a, b) => a - b)
				troc.start = new Date(dates[0]).toJSON()
				troc.end = new Date(dates[dates.length - 1]).toJSON()
			})

			//Mise à jour des markers
			trocs.slice(0, markers.length).forEach((troc, i) => {
				markers[i].off('click')
				markers[i].setLatLng(troc.location).bindTooltip(troc.name).on('click', () => clickMarker(troc._id))
			})
			if (trocs.length > markers.length) {
				trocs.slice(markers.length).forEach(troc => {
					markers.push(L.marker(troc.location, {icon}).addTo(map).bindTooltip(troc.name).on('click', () => clickMarker(troc._id)))
				})
			}else {
				markers.slice(trocs.length).forEach(m => m.remove())
				markers.splice(trocs.length)
			}
				
		} catch (error) {
			notify.error(error)
		}
		
	}

	function clickMarker(trocId) {
		let index = trocs.map(troc => troc._id).indexOf(trocId)
		if (index > -1) trocs[index].up = new Date().getTime()
	}

	function clickTroc(troc) {
		trocSelected = troc._id
		trocSelectedName = troc.name
	}

</script>

<svelte:window bind:scrollY bind:innerHeight></svelte:window>

<h3 class="w3-center">Trouver un troc</h3>

<br>

<!-- Commande -->
<div class="w3-row">

    <div class="w3-col m6 w3-padding">

        <!-- Search -->
        <TextField
			bind:value={search}
			on:input={newSearch}
			clearable
			placeholder="Recherche">
			<div slot="prepend">
				<Icon class="fas fa-search"/>
			</div>
		</TextField>

        <br><br>

		<div class="container-filter">
			<!-- Time filter -->
			<Switch
				bind:checked={timeFilter}
				on:change={() => loadTrocs()}
				color="grey">
				<Icon class="far fa-clock"></Icon>
				Période
			</Switch>
			
			<!-- Map filter -->
			<Switch
				bind:checked={mapFilter}
				on:change={() => loadTrocs()}
				color="grey">
				<Icon class="fas fa-globe-europe"/>
				Carte
			</Switch>
		</div>
		
        <br><br>
		{#if timeFilter}
			<div transition:fade|local class="container-filter">
				<TextField
					bind:value={start}
					on:change={newSearch}
					type="date">
					<div slot="prepend">
						<Icon class="far fa-calendar-alt"/>
					</div>
					A partir du
				</TextField>
				
				<TextField
					bind:value={end}
					on:input={newSearch}
					type="date">
					<div slot="prepend">
						<Icon class="far fa-calendar-alt"/>
					</div>
					Jusqu'au
				</TextField>
			</div>
		{/if}


    </div>

    <div class="w3-col m6">
        <div id="map"></div>
    </div>

</div>

<div class="results">
	{#each trocs.sort((a, b) => b.up - a.up).slice(0, limitTrocsDisplay) as troc (troc._id)}

		<div 
			in:receive|local={{key: troc._id}}
			out:send|local={{key: troc._id}}
			animate:flip={{duration: 500}}
			on:click={() => clickTroc(troc)}>
			<Card class="mt-8 pa-4">
				<TrocInfo {troc} on:clickArticles={dialogArticles.open}/>
			</Card>

		</div>

	{:else}
		<br>
		<span class="w3-large">
			Aucun troc ne correspond à la recherche
		</span>

	{/each}
</div>


<!-- Dialogs -->

<Dialog bind:this={dialogArticles} style="min-height: 430px;">
	<h2>Fouiller les articles dans <i>{trocSelectedName}</i></h2>
	
	<Articles troc={trocSelected}/>
	
</Dialog>

<svelte:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css">
	<style>#waitLoaded { display: none; }</style>
</svelte:head>

<style>

	#map {
		height: 280px;
		border-radius: 5px;
		z-index: 0;
	}

	.container-filter {
		display: flex;
		justify-content: space-around;
	}
	
</style>