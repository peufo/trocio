import axios from 'axios'
import notify from '$lib/notify'
import { addIsClosed } from '$lib/utils.js'
import type { Troc } from 'types'

export function getUserTrocs({ pageParam = 0 }) {
  return axios
    .get(`/api/subscribes/me?skip=${pageParam}&limit=2`)
    .then(({ data }) => {
      if (data.error) throw data.message
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })
}

export function getTrocs({ pageParam = 0, queryKey }) {
  let params = { skip: pageParam, ...queryKey[1], limit: pageParam ? 5 : 15 }
  return axios
    .get('/api/trocs/search', { params })
    .then(({ data }) => {
      if (data.error) throw data.message
      return data
    })
    .catch((error) => {
      throw notify.error(error)
    })

  /*

  let query = `/api/trocs/search?skip=${pageParam}&search=${search}`

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
    const json = await fetch(query).then((res) => res.json())
    if (json.error) throw json.message
    limitTrocsDisplay = skip + 3

    let up = skip ? trocs[trocs.length - 1].up : new Date().getTime()
    let newTrocs = json.map((troc) => {
      return { ...troc, up }
    })
    trocs = skip ? [...trocs, ...newTrocs] : newTrocs

    //Format les période
    trocs.forEach((troc) => {
      let dates = troc.schedule
        .map((s) => new Date(s.open).getTime())
        .sort((a, b) => a - b)
      troc.start = new Date(dates[0]).toJSON()
      troc.end = new Date(dates[dates.length - 1]).toJSON()
    })

    //Mise à jour des markers
    trocs.slice(0, markers.length).forEach((troc, i) => {
      markers[i].off('click')
      markers[i]
        .setLatLng(troc.location)
        .bindTooltip(troc.name)
        .on('click', () => clickMarker(troc._id))
    })
    if (trocs.length > markers.length) {
      trocs.slice(markers.length).forEach((troc) => {
        markers.push(
          L.marker(troc.location, { icon })
            .addTo(map)
            .bindTooltip(troc.name)
            .on('click', () => clickMarker(troc._id))
        )
      })
    } else {
      markers.slice(trocs.length).forEach((m) => m.remove())
      markers.splice(trocs.length)
    }
  } catch (error) {
    notify.error(error)
  }
  */
}
