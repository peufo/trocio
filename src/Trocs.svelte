<script>
	import { onMount } from 'svelte'
	import L from 'leaflet'
	import dayjs from 'dayjs'
	import Range from './Range.svelte'

	let periode = {start: new Date().toJSON(), end: dayjs().add(20, 'day').toJSON()}
	console.log(periode)
	
	onMount(() => {
		let map = L.map('map', {
		    center: [47.4013048812248, 7.076493501663209],
		    zoom: 6
		})

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map)

		map.on('click', onMapClick)

	})

	function onMapClick(e) {
		console.log(e)
	}

</script>


<div class="w3-padding w3-center">
	<h2>Trouve un troc dans la région</h2>
	<div id="map"></div>
	<br>
	<Range/>

</div>


<svelt:head>
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css">
</svelt:head>

<style>

	#map {
		height: 400px;
		border-radius: 5px;
		z-index: 0;
	}

</style>