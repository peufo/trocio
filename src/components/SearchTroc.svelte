<script>
	import { goto } from '@sveltech/routify'
	import { onMount } from 'svelte'
	import { flip } from 'svelte/animate'
    import { crossfade, slide } from 'svelte/transition'

	import Dialog, {Title, Content} from '@smui/dialog'
	import Textfield from '@smui/textfield'
	import Switch from '@smui/switch'
	import FormField from '@smui/form-field'

	import dayjs from 'dayjs'
	import relativeTime from 'dayjs/plugin/relativeTime'
	import 'dayjs/locale/fr'

	import L from 'leaflet'

	import { user, subscribedTrocs } from 'stores.js'
	import { getHeader, crossfadeConfig } from 'utils.js'
	import notify from 'notify.js'
	import TrocInfo from 'TrocInfo.svelte'
	import Resume 	from 'Resume.svelte'
	import Articles from 'Articles.svelte'
	import Login 	from 'Login.svelte'
	
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
		timeFilter = false,
		search = '',
		start = dayjs().format('YYYY-MM-DD'), 
		end = ''

	//Dialogs
	let dialogLogin, dialogArticles


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
	
			map.on('move', onMapMove)
	
			loadTrocs()

		}, mapDelay)

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
			let up = new Date().getTime()
			trocs = json.map(troc =>  {
				return {...troc, up}
			})

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
		})
	}

	function clickMarker(trocId) {
		let index = trocs.map(troc => troc._id).indexOf(trocId)
		if (index > -1) trocs[index].up = new Date().getTime()
	}

	async function clickActivity(trocId) {
		if ($user) {
			let troc = trocs[trocs.map(t => t._id).indexOf(trocId)]
			if (!troc.isSubscribed) {
				let res = await fetch('/subscribes', getHeader({troc: trocId}))
				let json = await res.json()
				if (json.error) return notify.error(json.message)
				notify.success('Vous participez à un nouveau troc')
				$subscribedTrocs.push(troc)
			}
			$goto(`/activity/detail?troc=${trocId}`)
		}else{
			dialogLogin.open()
		}
	}

	function loginClose() {
		dialogLogin.close()
		setTimeout(() => clickActivity(trocSelected), 100)
	}

	function clickTroc(troc) {
		trocSelected = troc._id
		trocSelectedName = troc.name
	}


</script>

<h3 class="mdc-typography--headline6" >Trouver un troc</h3><br>

<!-- Commande -->
<div class="w3-row">

    <div class="w3-col m6 w3-padding">

        <!-- Search -->
        <Textfield
        class="w3-large"
		style="width: 100%;"
        bind:value={search}
        on:input={newSearch}
        type="search"
        label="Recherche"
        ></Textfield>
        <br><br>

        <!-- Map filter -->
        <FormField>
            <Switch bind:checked={mapFilter} on:input={() => setTimeout(loadTrocs, 0)}/>
            <span slot="label">
                <i class="fas fa-globe-europe w3-large"></i>
                <span class="w3-large">Carte</span>
            </span>
        </FormField>
        
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <!-- Time filter -->
        <FormField>
            <Switch bind:checked={timeFilter} on:input={() => setTimeout(loadTrocs, 0)}/>
            <span slot="label">
                <i class="far fa-clock w3-large"></i>
                <span class="w3-large">Période</span>
            </span>
        </FormField><br><br>

        {#if timeFilter}
            <div transition:slide|local class="w3-margin-bottom">
                <Textfield bind:value={start} on:input={() => setTimeout(loadTrocs, 0)} type="date" label="A partir du"/>
                &nbsp;
                <Textfield bind:value={end} on:input={() => setTimeout(loadTrocs, 0)} type="date" label="Jusqu'au"/>
            </div>
        {/if}

    </div>

    <div class="w3-col m6">
        <div id="map"></div>
    </div>

</div>

<!-- Résultat -->
{#each trocs.sort((a, b) => b.up - a.up) as troc (troc._id)}

    <div 
		in:receive|local={{key: troc._id}}
		out:send|local={{key: troc._id}}
		animate:flip={{duration: 500}}
		on:click={() => clickTroc(troc)}
		class="simple-card">
		
        <TrocInfo {troc}
			nameDisplay
			buttonsDisplay
			on:clickArticles={dialogArticles.open}
			on:clickActivity={() => clickActivity(troc._id)}/>
		
		{troc.up}

    </div>

{:else}
    <br>
    <span class="w3-large">
        Aucun troc ne correspond à la recherche
    </span>

{/each}



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

	#map {
		height: 280px;
		border-radius: 5px;
		z-index: 0;
	}

	.simple-card {
		margin-top: 30px;
		margin-bottom: 30px;
		padding: 1em;
		box-shadow: 0px 0px 10px rgba(78, 78, 78, 0.15);
		transition: all .2s;
		background: #fff;
	}

	.simple-card:hover {
		box-shadow: 0px 0px 10px rgba(78, 78, 78, 0.25);
	}

	.simple-card:last-child {
		margin-bottom: 80px;
	}
	

</style>