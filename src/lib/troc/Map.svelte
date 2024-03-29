<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import L from 'leaflet'
  import 'leaflet/dist/leaflet.css'
  import debounce from 'debounce'

  import { queryTrocsParams } from '$lib/troc/store'
  import markerIcon from '$assets/images/marker-icon.png'
  import markerIcon2X from '$assets/images/marker-icon-2x.png'
  import { trocs, trocsElement, map } from '$lib/troc/store'

  const dispatch = createEventDispatcher()

  let mapId = 'map' + Math.random()
  let markers: L.Marker[] = []
  const icon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2X,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    tooltipAnchor: [14, -30],
  })

  // Flag util pour s'assuré de l'origine des zoom et move de la map
  let isUserAction = false

  trocs.subscribe(updateMarkers)

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

    $map.on('move', (event) => isUserAction && handleMoveMap())
    $map.on('zoom', (event) => isUserAction && handleMoveMap())
  })

  onDestroy(() => {
    // $map.remove()
  })

  const handleMoveMap = debounce(loadBounds, 200)

  function loadBounds() {
    let sw = $map.getBounds().getSouthWest()
    let ne = $map.getBounds().getNorthEast()
    queryTrocsParams.update((query) => ({
      ...query,
      north: ne.lat,
      east: ne.lng,
      sud: sw.lat,
      west: sw.lng,
    }))
  }

  function updateMarkers() {
    // For HMR
    if (!$map?.getPanes()?.mapPane) return

    $trocs.slice(0, markers.length).forEach((troc, i) => {
      if (!troc.location) return
      markers[i].off('click')
      markers[i]
        .setLatLng(troc.location)
        .bindTooltip(troc.name)
        .on('click', () => handleClickMarker(troc._id))
    })
    if ($trocs.length > markers.length) {
      $trocs.slice(markers.length).forEach((troc) => {
        if (!troc.location) return
        markers.push(
          L.marker(troc.location, { icon })
            .addTo($map)
            .bindTooltip(troc.name)
            .on('click', () => handleClickMarker(troc._id))
        )
      })
    } else {
      markers.slice($trocs.length).forEach((m) => m.remove())
      markers.splice($trocs.length)
    }
  }

  /** Scroll et attire l'attention sur le bon troc quand on click sur un marker. */
  function handleClickMarker(trocId: string) {
    dispatch('clickMarker')
    const trocElement = $trocsElement[trocId]
    if (!trocElement) return
    const positionTarget = trocElement.offsetTop - 100
    window.scrollTo({
      top: positionTarget || 0,
      behavior: 'smooth',
    })

    function animate() {
      trocElement.classList.add('animate__animated', 'animate__headShake')
      setTimeout(() => {
        trocElement.classList.remove('animate__animated', 'animate__headShake')
      }, 1500)
    }

    /* Déclenche l'animation dés que le scroll est terminé */
    let position: number | null = null
    const checkIfScrollIsStatic = setInterval(() => {
      if (position === window.scrollY) {
        clearInterval(checkIfScrollIsStatic)
        animate()
      }
      position = window.scrollY
    }, 50)
  }
</script>

<div
  class="map"
  id={mapId}
  on:mouseover={() => (isUserAction = true)}
  on:focus={() => (isUserAction = true)}
  on:touchstart={() => (isUserAction = true)}
  on:mouseleave={() => (isUserAction = false)}
  on:touchend={() => (isUserAction = false)}
/>

<style>
  .map {
    height: 250px;
    border-radius: 5px;
    z-index: 0;
  }
</style>
