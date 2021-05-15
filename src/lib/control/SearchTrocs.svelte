<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'
  import { TextField, Switch, Icon, Checkbox } from 'svelte-materialify'
  import dayjs from 'dayjs'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import debounce from 'debounce'

  import type { Troc } from 'types'
  import markerIcon from '$assets/images/marker-icon.png'
  import markerIcon2X from '$assets/images/marker-icon-2x.png'

  export let search = ''
  export let timeFilter: { start?: string; end?: string } = {}
  export let mapFilter: {
    north?: number
    east?: number
    sud?: number
    west?: number
  } = {}

  export let query = {}
  $: query = { search, ...timeFilter, ...mapFilter }

  export let trocs: Array<{ up?: number } & Troc> = []
  $: trocs && updateMarkers()

  let timeFilterChecked = false
  let start = dayjs().format('YYYY-MM-DD')
  let end = dayjs().add(6, 'month').format('YYYY-MM-DD')
  $: timeFilter = timeFilterChecked ? { start, end } : {}

  let mapFilterChecked = true
  let north
  let east
  let sud
  let west
  $: mapFilter = mapFilterChecked ? { north, east, sud, west } : {}

  export let map
  let mapId = 'map' + Math.random()
  let markers = []
  const icon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2X,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    tooltipAnchor: [14, -30],
  })

  const dispatch = createEventDispatcher()

  onMount(() => {
    map = L.map(mapId, {
      center: [47.4013048812248, 7.076493501663209],
      zoom: 6,
      watch: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map)

    loadBounds()
    map.on('move', (event) => !!event.originalEvent && handleMoveMap())
  })

  onDestroy(() => {
    map.remove()
  })

  const handleMoveMap = debounce(loadBounds, 200)

  function loadBounds() {
    let sw = map.getBounds()._southWest
    let ne = map.getBounds()._northEast
    north = ne.lat
    east = ne.lng
    sud = sw.lat
    west = sw.lng
  }

  const handleSearch = debounce((event) => {
    search = event.target.value
  }, 300)

  function updateMarkers() {
    if (!map) return

    trocs.slice(0, markers.length).forEach((troc, i) => {
      markers[i].off('click')
      markers[i]
        .setLatLng(troc.location)
        .bindTooltip(troc.name)
        .on('click', () => clickMarker(troc))
    })
    if (trocs.length > markers.length) {
      trocs.slice(markers.length).forEach((troc) => {
        markers.push(
          L.marker(troc.location, { icon })
            .addTo(map)
            .bindTooltip(troc.name)
            .on('click', () => clickMarker(troc))
        )
      })
    } else {
      markers.slice(trocs.length).forEach((m) => m.remove())
      markers.splice(trocs.length)
    }
  }

  function clickMarker(troc: Troc) {
    dispatch('clickMarker', troc)
  }
</script>

<div class="container simple-card pa-4">
  <h5>Trouver un troc</h5>

  <div class="form">
    <!-- Search -->
    <TextField
      on:input={handleSearch}
      on:change={handleSearch}
      clearable
      placeholder="Recherche"
    >
      <div slot="prepend">
        <Icon class="fas fa-search" />
      </div>
    </TextField>

    <br /><br />

    <!-- Time filter -->
    <Switch bind:checked={timeFilterChecked} color="grey">
      Filtrer sur une période
    </Switch>
    <br />

    <div transition:fade|local class="d-flex">
      <TextField bind:value={start} type="date">A partir du</TextField>

      <TextField bind:value={end} type="date">Jusqu'au</TextField>
    </div>
  </div>

  <br />
  <br />

  <!-- Map filter -->
  <Switch bind:checked={mapFilterChecked} color="grey">
    Filtrer sur la carte
  </Switch>

  <div class="map" id={mapId} />
</div>

<style>
  .container {
    max-width: 850px;
    overflow-y: auto;
    max-height: 100%;
  }

  .map {
    height: 280px;
    border-radius: 5px;
    z-index: 0;
  }
</style>
