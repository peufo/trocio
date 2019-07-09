<script>
	import { onMount } from 'svelte'
	import { fade, fly, slide } from 'svelte/transition'
	import L from 'leaflet'

	export let address = ''
	export let location = {lat: 0 , lng: 0}

	let map,
		marker,
		promise,
		markers = [],
		results = []
		

	onMount(() => {
		map = L.map('map', {
		    center: [47.4013048812248, 7.076493501663209],
		    zoom: 4
		})
		
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map)

		marker = L.marker([0, 0])

		map.on('dblclick', e => promise = getAddress(e))

	})


	async function getAddress(e) {
		marker.setLatLng(e.latlng).addTo(map)
		location = {lat: e.latlng.lat, lng: e.latlng.lng}
		let res = await fetch(`/geocode/${location.lat}+${location.lng}`)
		let json = await res.json()
		address = json[0].address
		return
	}

	function searchLocation() {
		document.getElementById('searchInput').focus()
		promise = getLocation()
	}

	async function getLocation() {
		results = []
		markers.forEach(m => m.remove())
		let res = await fetch(`/geocode/${address}`)
		let json = await res.json()
		results = json
		if (json.length) {
			markers = json.map(j => L.marker(j.location, {opacity: 0.5}).addTo(map).bindTooltip(j.address))
		}
		console.log(json)
		console.log(markers)
		return json
	}

	function locationString(loc) {
		if (!loc.lat)return 'Non défini'
		let lat = numberToString(loc.lat)
		lat += loc.lat >= 0 ? 'N' : 'S'
		let lng = numberToString(loc.lng)
		lng += loc.lng >= 0 ? 'E' : 'W'
		return `${lat} ${lng}`
		
	}
	function numberToString(num) {
		num = Math.abs(num)
		let deg = Math.floor(num)
		let min = Math.floor((num - deg) * 60)
		let sec = Math.round((num - deg - min / 60) * 3600)
		return `${deg}°${min}'${sec}''`
	}

</script>

<div id="container" class="w3-border w3-round">
	<div>
		<div id="searchButton" on:click={searchLocation} class="w3-right w3-xlarge w3-border-bottom w3-padding">
			{#await promise}
				<i class="fas fa-spinner w3-spin"></i>
			{:then}
				<i class="fas fa-search-location"></i>
			{/await}
		</div>

		<input  id="searchInput"
				on:keyup="{e => e.which == 13 && searchLocation()}" 
				bind:value={address}
				class="w3-input w3-large"
				type="text"
				placeholder="Adresse, Ville, Pays">	

	</div>

	<div id="map"></div>
	<span id="latlngInfo" class="w3-tiny w3-left">
		<i class="fas fa-map-marker-alt"></i>
		{locationString(location)}
	</span>

	{#if results.length}
	<div in:slide>
		<ul class="w3-ul">
		{#each results as res}
			<li>
				{res.address}
			</li>
		{/each}
		</ul>			
	</div>
	{/if}
	
</div>


<svelt:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css">
</svelt:head>
<style>
	#container {
		position: relative;
	}

	#map {
		height: 200px;
		z-index: 0;
	}

	#searchInput {
		width: calc(100% - 56px);
		border-radius: 3px 0px 0px 0px;
	}

	#searchButton {
		cursor: pointer;
		height: 44px;
	}

	i {
		transition: all 0.2s ease;
	}

	ul {
		max-height: 200px;
		overflow-y: scroll;
		text-align: left;
	}

	#searchButton:hover {
		background: #d8d8d8;
	}

	#searchButton:hover i{
		transform: scale(1.1);
	}

	#latlngInfo {
		transform: translate(0, -15px);
		position: absolute;
		left: 0px;
		background: rgba(255, 255, 255, 0.5);
		padding-left: 4px;
		padding-right: 4px;
	}

</style>