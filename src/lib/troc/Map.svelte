<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { Switch } from 'svelte-materialify'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import debounce from 'debounce'

  import markerIcon from '$assets/images/marker-icon.png'
  import markerIcon2X from '$assets/images/marker-icon-2x.png'

  import { trocs, trocsElement, map } from '$lib/troc/store'

  export let mapFilter: {
    north?: number
    east?: number
    sud?: number
    west?: number
  } = {}
  // TODO: remove mapFilterChecked ?
  let mapFilterChecked = true
  let north
  let east
  let sud
  let west
  $: mapFilter = mapFilterChecked ? { north, east, sud, west } : {}

  $: $trocs && updateMarkers()

  let mapId = 'map' + Math.random()
  let markers = []
  const icon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2X,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    tooltipAnchor: [14, -30],
  })

  onMount(() => {
    $map = L.map(mapId, {
      center: [47.4013048812248, 7.076493501663209],
      zoom: 6,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo($map)

    loadBounds()
    $map.on('move', (event) => !!event.originalEvent && handleMoveMap())
    $map.on('zoom', handleMoveMap)
  })

  onDestroy(() => {
    $map.remove()
  })

  const handleMoveMap = debounce(loadBounds, 200)

  function loadBounds() {
    let sw = $map.getBounds()._southWest
    let ne = $map.getBounds()._northEast
    north = ne.lat
    east = ne.lng
    sud = sw.lat
    west = sw.lng
  }

  function updateMarkers() {
    // For HMR
    if (!$map?._panes?.mapPane) return

    $trocs.slice(0, markers.length).forEach((troc, i) => {
      markers[i].off('click')
      markers[i]
        .setLatLng(troc.location)
        .bindTooltip(troc.name)
        .on('click', () => clickMarker(troc))
    })
    if ($trocs.length > markers.length) {
      $trocs.slice(markers.length).forEach((troc) => {
        markers.push(
          L.marker(troc.location, { icon })
            .addTo($map)
            .bindTooltip(troc.name)
            .on('click', () => clickMarker(troc))
        )
      })
    } else {
      markers.slice($trocs.length).forEach((m) => m.remove())
      markers.splice($trocs.length)
    }
  }

  /** Scroll et attire l'attention sur le bon troc quand on click sur un marker. */
  function clickMarker(troc) {
    const trocElement = $trocsElement[troc._id]
    if (!trocElement) return
    const positionTarget = trocElement.offsetTop - 265
    window.scrollTo({
      top: positionTarget || 0,
      behavior: 'smooth',
    })

    function animate() {
      trocElement.classList.add('animate__animated', 'animate__shakeX')
      setTimeout(() => {
        trocElement.classList.remove('animate__animated', 'animate__shakeX')
      }, 500)
    }

    /* Déclenche l'animation dés que le scroll est static */
    let position = null
    const checkIfScrollIsStatic = setInterval(() => {
      if (position === window.scrollY) {
        clearInterval(checkIfScrollIsStatic)
        animate()
      }
      position = window.scrollY
    }, 50)
  }
</script>

<!-- Map filter -->
<!--
  <Switch bind:checked={mapFilterChecked} color="grey">
    Filtrer sur la carte
  </Switch>
-->

<div class="map" id={mapId} />

<style>
  .map {
    height: 250px;
    border-radius: 5px;
    z-index: 0;
  }
</style>
