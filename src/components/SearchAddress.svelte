<script lang="ts">
  import { onMount } from 'svelte'
  import { slide } from 'svelte/transition'

  import { Textarea, TextField, Icon } from 'svelte-materialify'
  import L from 'leaflet'
  import debounce from 'debounce'

  export let address = ''
  export let location = { lat: 0, lng: 0 }
  export let changeFlag = false
  export let mapDelay = 0

  let map,
    icon,
    marker,
    fetchPromise,
    markers = [],
    results = [],
    selected = -1,
    addressTextarea

  function setLocation(loc) {
    location = loc.location
    address = loc.address.split(', ').join('\n')
    marker.setLatLng(location).addTo(map)
    map.setView(location)
    changeFlag = true
    setTimeout(() => (changeFlag = false), 10) // Util pour l'autoPatch
  }

  function removeResults() {
    selected = -1
    results = []
    markers.forEach((m) => m.remove())
  }

  onMount(() => {
    setTimeout(() => {
      map = L.map('map', {
        center: [47.4013048812248, 7.076493501663209],
        zoom: 4,
      })

      icon = L.icon({
        iconUrl: '/images/marker-icon.png',
        iconRetinaUrl: '/images/marker-icon-2x.png',
        iconSize: [28, 42],
        iconAnchor: [14, 42],
        popupAnchor: [-14, 40],
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map)

      if (location.lat) {
        marker = L.marker(location, { icon }).addTo(map)
        map.setView(location)
      } else {
        marker = L.marker([0, 0], { icon })
      }

      map.on(
        'dblclick',
        ({ latlng }) => (fetchPromise = selectLocation(latlng))
      )
    }, mapDelay)
  })

  /** Obtient une adresse a partir de coordonné */
  async function selectLocation(latlng: { lat: number; lng: number }) {
    marker.setLatLng(latlng).addTo(map)
    try {
      let res = await fetch(`/__API__/geocode/${latlng.lat}+${latlng.lng}`)
      let json = await res.json()
      setLocation({ location: latlng, address: json[0].address })
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
        let res = await fetch(`/__API__/geocode/${searchValue}`)
        let json = await res.json()
        if (json.length == 1) {
          setLocation(json[0])
          return json
        } else if (json.length > 1) {
          results = json
          markers = json.map((j) =>
            L.marker(j.location, { icon, opacity: 0.5 })
              .addTo(map)
              .bindTooltip(j.address)
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
  function locationString(loc) {
    if (!loc.lat) return ''
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

  function searchKeyup(e) {
    let elem, container, posY
    switch (e.key) {
      case 'ArrowDown':
        selected++
        if (selected >= results.length) selected = results.length - 1
        if (selected > -1) {
          elem = document.getElementById(`result${selected}`)
          container = document.getElementById('results')
          posY = elem.offsetTop - 244 + elem.clientHeight
          if (container.scrollTop + container.clientHeight < posY) {
            container.scrollTop = posY - container.clientHeight
          }
          setLocation(results[selected])
        }
        break
      case 'ArrowUp':
        selected--
        if (selected < 0) selected = 0
        elem = document.getElementById(`result${selected}`)
        container = document.getElementById('results')
        posY = elem.offsetTop - 244
        if (container.scrollTop > posY) container.scrollTop = posY
        setLocation(results[selected])
        break
      default:
        searchLocationDebounce(e.target.value)
    }
  }
</script>

<div id="container">

  <div id="map" />

  <br />

  <TextField
    outlined
    on:keyup={searchKeyup}
    value={locationString(location)}
    hint="Chercher une ville ou double-cliquer sur la carte"
  >
    <div slot="append">
      {#await fetchPromise}
        <Icon class="fas fa-spinner w3-spin" />
      {:then}
        <Icon class="fas fa-map-marker-alt" />
      {/await}
    </div>
    Localisation
  </TextField>
  <br />

  <Textarea
    rows={3}
    noResize
    outlined
    autogrow
    bind:textarea={addressTextarea}
    bind:value={address}
  >
    Address, Ville, Pays
  </Textarea>

  {#if results.length}
    <div in:slide>
      <ul id="results" class="w3-ul">
        {#each results as res, i}
          <li
            id="result{i}"
            class:selected={selected == i}
            on:click={() => {
              selected = i
              setLocation(res)
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
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.5.1/leaflet.css"
  />
</svelte:head>

<style>
  #container {
    position: relative;
  }

  #map {
    height: 200px;
    width: 100%;
    z-index: 0;
  }

  /*
	#searchInput {
		width: calc(100% - 56px);
		border-radius: 3px 0px 0px 0px;
	}

	#searchButton {
		cursor: pointer;
		height: 44px;
	}
	#searchButton:hover {
		background: #d8d8d8;
	}

	#searchButton:hover i{
		transform: scale(1.1);
	}
	*/

  i {
    transition: all 0.2s ease;
  }

  ul {
    max-height: 200px;
    overflow-y: scroll;
    text-align: left;
  }

  ul li {
    cursor: pointer;
  }

  #latlngInfo {
    transform: translate(0, -15px);
    position: absolute;
    color: #000;
    left: 0px;
    background: rgba(255, 255, 255, 0.5);
    padding-left: 4px;
    padding-right: 4px;
  }

  .selected {
    background: #d8d8d8;
  }

  #results {
    scroll-behavior: smooth;
  }
</style>
