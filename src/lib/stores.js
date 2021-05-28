import { writable } from 'svelte/store'
import qs from 'qs'

import { userQuery } from './user/store'
import { addStatutField } from './utils'
import notify from './notify'

//Theme
export let isDarkTheme = writable(false)

//Troc's meta
export let troc = trocBuilder()
export let trocPromise = writable()

//Troc's details related of an user
export let trocDetails = trocDetailsBuilder()
export let trocDetailsPromise = writable()

export let subscribedTrocs = writable([]) //Managed with /activity/layout

export let cashierOptions = writable({ autoPrintTag: true }) //Managed with cashier

let userPromiseSubscribed
userQuery.subscribe((v) => {
  userPromiseSubscribed = v
})

// ------------------------------------------------------
// 							UTIL
// ------------------------------------------------------
function buildListenQuery(query, promise, load, set) {
  query = query.split(' ')
  let lastQuery = undefined
  let newQuery = undefined
  let createPromise = () => {
    let parsed = qs.parse(location.search.substr(1))
    newQuery = query.map((q) => parsed[q]).join(' ')
    if (newQuery != lastQuery) promise.set(load(set, parsed))
    lastQuery = newQuery
  }
  return (set) => {
    createPromise()
    addEventListener('locationchange', createPromise)
    return () => {
      removeEventListener('locationchange', createPromise)
    }
  }
}

// ------------------------------------------------------
// 							TROC
// ------------------------------------------------------

function trocBuilder() {
  const { subscribe, set } = writable(null, (set) =>
    buildListenQuery('troc', trocPromise, loadTroc, set)()
  )
  return {
    subscribe,
    set,
    refresh: (newTroc) => {
      set(newTroc)
    },
  }
}

async function loadTroc(set, { troc }) {
  if (!troc) return set(null)
  try {
    let res = await fetch(`/api/trocs/${troc}`)
    let json = await res.json()
    if (res.ok) {
      set(json)
    } else {
      switch (res.status) {
        case 401:
          set({ failed: true, reason: 'Login required' })
          break
        default:
          set({ failed: true, reason: 'Not found' })
          break
      }
    }
  } catch (error) {
    notify.error(error)
    return error
  }
}

// ------------------------------------------------------
// 				       TROC DETAILS
// ------------------------------------------------------
function trocDetailsBuilder() {
  const { subscribe, set } = writable(null, (set) =>
    buildListenQuery('troc client', trocDetailsPromise, loadTrocDetails, set)()
  )
  return {
    subscribe,
    set,
  }
}

async function loadTrocDetails(set, { troc, client }) {
  if (!troc) return set(null)

  let details = {}
  //load client's details if he exist
  if (client) {
    details = await getDetail(troc, client)
  } else {
    let user = client || (await userPromiseSubscribed)
    details = await getDetail(troc, user._id)
  }

  set(details)

  return
}

async function getDetail(troc, user) {
  try {
    const res = await fetch(`/api/trocs/details?user=${user}&troc=${troc}`)
    let details = await res.json()
    if (details.error) throw details.message
    if (details.provided)
      details.provided = addStatutField(details.provided, '')
    //select last giveback
    details.givebacks = details.givebacks.map((art) => {
      art.giveback = art.giveback
        .filter((back) =>
          user === 'undefined' ? !back.user : back.user == user
        )
        .reverse()[0]
      if (art.giveback)
        art.giveback.back = new Date(art.giveback.back).getTime()
      return art
    })

    return details
  } catch (error) {
    notify.error(error)
    return error
  }
}
