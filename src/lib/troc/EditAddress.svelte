<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import { Textarea, TextField, Icon, List, ListItem } from 'svelte-materialify'
  import L from 'leaflet'
  import debounce from 'debounce'

  import markerIcon from '$assets/images/marker-icon.png'
  import markerIcon2X from '$assets/images/marker-icon-2x.png'

  export let address = ''
  export let location: { lat: number; lng: number } | undefined = undefined
  export let mapDelay = 0
  export let currency = ''

  $: locationString = locationToString(location)

  const dispatch = createEventDispatcher()

  let mapElement: HTMLDivElement
  let addressTextarea: HTMLTextAreaElement

  let map: L.Map
  let icon: L.Icon
  let marker: L.Marker
  let markers: L.Marker[] = []

  interface ResultLocation {
    address: string
    location: Location
    country_code: string
    currency: string
    _type: string
  }

  interface Location {
    lat: number
    lng: number
  }

  let results: ResultLocation[] = []
  let selectedResult = -1
  let fetchPromise: Promise<ResultLocation[]>

  function setLocation(loc: ResultLocation) {
    location = loc.location
    address = loc.address.split(', ').join('\n')
    currency = loc.currency
    marker.setLatLng(location).addTo(map)
    map.setView(location)
    dispatch('change', { location, address, currency })
  }

  function removeResults() {
    selectedResult = -1
    results = []
    markers.forEach((m) => m.remove())
  }

  onMount(() => {
    setTimeout(() => {
      map = L.map(mapElement, {
        center: [47.4013048812248, 7.076493501663209],
        zoom: 4,
      })

      icon = L.icon({
        iconUrl: markerIcon,
        iconRetinaUrl: markerIcon2X,
        iconSize: [28, 42],
        iconAnchor: [14, 42],
        popupAnchor: [-14, 40],
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      if (location?.lat) {
        marker = L.marker(location, { icon }).addTo(map)
        map.setView(location)
      } else {
        marker = L.marker([0, 0], { icon })
      }

      map.on(
        'dblclick',
        // @ts-ignore
        ({ latlng }) => (fetchPromise = selectLocation(latlng))
      )
    }, mapDelay)
  })

  /** Obtient une adresse a partir de coordonné */
  async function selectLocation(latlng: { lat: number; lng: number }) {
    marker.setLatLng(latlng).addTo(map)
    try {
      let res = await fetch(`/api/geocode/${latlng.lat}+${latlng.lng}`)
      let json = await res.json()
      setLocation({ ...json[0], location: latlng })
      addressTextarea.focus()
      return
    } catch (error) {
      console.trace(error)
    }
  }

  /** Obtient une liste de suggestion de localisation en fonction d'une recherche */
  function searchLocation(searchValue: string) {
    fetchPromise = (async () => {
      removeResults()
      try {
        let res = await fetch(`/api/geocode/${searchValue}`)
        let json = await res.json()
        if (json.length == 1) {
          setLocation(json[0])
          return json
        } else if (json.length > 1) {
          results = json
          markers = results.map((result) =>
            L.marker(result.location, { icon, opacity: 0.5 })
              .addTo(map)
              .bindTooltip(result.address)
          )
          return json
        }
      } catch (error) {
        console.trace(error)
      }
    })()
  }
  const searchLocationDebounce = debounce(searchLocation, 300, false)

  /** Convertie un localisation {lat, lng} en string */
  function locationToString(loc?: Location) {
    console.log({ loc })
    if (!loc) return ''
    let lat = numberToString(loc.lat)
    lat += loc.lat >= 0 ? 'N' : 'S'
    let lng = numberToString(loc.lng)
    lng += loc.lng >= 0 ? 'E' : 'W'
    return `${lat} ${lng}`
  }

  function numberToString(num: number) {
    num = Math.abs(num)
    let deg = Math.floor(num)
    let min = Math.floor((num - deg) * 60)
    let sec = Math.round((num - deg - min / 60) * 3600)
    return `${deg}°${min}'${sec}''`
  }

  function searchKeyup(e: KeyboardEvent) {
    switch (e.key) {
      case 'ArrowDown':
        selectedResult++
        if (selectedResult >= results.length)
          selectedResult = results.length - 1
        if (selectedResult > -1) {
          setLocation(results[selectedResult])
        }
        break
      case 'ArrowUp':
        selectedResult--
        if (selectedResult < 0) selectedResult = 0
        setLocation(results[selectedResult])
        break
      default:
        // @ts-ignore
        searchLocationDebounce(e.target.value)
    }
  }
</script>

<div class="container">
  <div class="map" bind:this={mapElement} />

  <br />

  <TextField
    outlined
    on:keyup={searchKeyup}
    on:blur={() => setTimeout(() => removeResults(), 200)}
    value={locationString}
    hint="Chercher une ville et double-cliquer sur la carte"
  >
    <div slot="append">
      {#await fetchPromise}
        <Icon class="fas fa-spinner" spin />
      {:then}
        <Icon class="fas fa-map-marker-alt" />
      {/await}
    </div>
    Localisation
  </TextField>

  {#if results.length}
    <div in:slide>
      <List class="results" dense>
        {#each results as res, i}
          <ListItem
            active={selectedResult == i}
            on:click={() => {
              selectedResult = i
              setLocation(res)
              // searchLocation
            }}
            on:dblclick={removeResults}
          >
            <i
              class="fa"
              class:fa-globe-europe={res._type == 'country' ||
                res._type == 'state' ||
                res._type == 'county'}
              class:fa-city={res._type == 'city' ||
                res._type == 'village' ||
                res._type == 'neighbourhood'}
              class:fa-money-bill-alt={res._type == 'bank'}
              class:fa-road={res._type == 'road'}
              class:fa-home={res._type == 'building' ||
                res._type == 'construction'}
              class:fa-water={res._type == 'river' ||
                res._type == 'stream' ||
                res._type == 'weir' ||
                res._type == 'wetland'}
              class:fa-swimming-pool={res._type == 'basin' ||
                res._type == 'swimming_pool'}
              class:fa-parking={res._type == 'parking'}
              class:fa-tree={res._type == 'forest' || res._type == 'park'}
              class:fa-train={res._type == 'station'}
              class:fa-bus={res._type == 'bus_stop'}
              class:fa-store={res._type == 'commercial' ||
                res._type == 'supermarket'}
              class:fa-monument={res._type == 'monument' ||
                res._type == 'attraction'}
              class:fa-tshirt={res._type == 'clothes' || res._type == 'carpet'}
              class:fa-mountain={res._type == 'peak'}
              class:fa-film={res._type == 'cinema'}
              class:fa-utensils={res._type == 'restaurant'}
              class:fa-basketball-ball={res._type == 'sports'}
              class:fa-tractor={res._type == 'meadow'}
            />
            {res.address}
          </ListItem>
        {/each}
      </List>
    </div>
  {/if}

  <br />

  <Textarea
    rows={3}
    noResize
    outlined
    autogrow
    placeholder=" "
    hint={currency ? `Devise: ${currency}` : ''}
    on:input={() => {
      dispatch('change', { location, address })
    }}
    bind:textarea={addressTextarea}
    bind:value={address}
  >
    Address, Ville, Pays
  </Textarea>
</div>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css"
  />
</svelte:head>

<style>
  .container {
    position: relative;
  }

  .map {
    height: 200px;
    width: 100%;
    z-index: 0;
  }

  i {
    transition: all 0.2s ease;
  }
</style>
