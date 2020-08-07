import { writable } from 'svelte/store'
import { getHeader, getDetail } from './utils'
import qs from 'qs'

export let user = userBuilder()
export let userPromise = writable()

//Troc's meta
export let troc = trocBuilder()			 
export let trocPromise = writable()

//Troc's details related of an user
export let trocDetails = trocDetailsBuilder()
export let trocDetailsPromise = writable()

let userPromiseSubscribed
userPromise.subscribe(v => {
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
		newQuery = query.map(q => parsed[q]).join(' ')
		if (newQuery != lastQuery) promise.set(load(set, parsed))
		lastQuery = newQuery
	}
	return set => {
		createPromise()
		addEventListener('locationchange', createPromise)
		return () => {
			removeEventListener('locationchange', createPromise)
		}
	}
}


// ------------------------------------------------------
// 							USER
// ------------------------------------------------------

function userBuilder() {
	const { subscribe, set} = writable({}, loadUser)
	set(undefined)
	return {
		subscribe, set,
		login: async (mail, password, cb) => {
			let res = await fetch('/users/login', getHeader({mail, password}))
			let json = await res.json()
			if (res.ok && !json.error) {
				loadUser(set)
				cb()
			}else{
				set(null)
				cb(json)
			}
		},
		logout: async () => {
			let res = await fetch('/users/logout')
			let json = await res.json()
			//if (res.ok && json.success)
			set(null)
		}
	}

}

function loadUser(set) {
	userPromise.set(authenticate(set))
	return () => {}
}

async function authenticate(set) {
	let res = await fetch('/users/me')
	let json = await res.json()
	if (res.ok && !json.error) {
		set(json)
		return json
	}else{
		set(null)
		return Error(json.message)
	}
}

// ------------------------------------------------------
// 							TROC
// ------------------------------------------------------

function trocBuilder() {
	const { subscribe, set } = writable(null, set => (buildListenQuery('troc', trocPromise, loadTroc, set))())
	return {
		subscribe, set,
		refresh: newTroc => {
			set(newTroc)
		}
	}
}

async function loadTroc(set, { troc }) {
	if(!troc) return set(null)
	let res = await fetch(`/trocs/${troc}`)
	let json = await res.json()	
	if (res.ok) {
		set(json)
	}else{
		switch (res.status) {
			case 401:
				set({failed: true, reason: 'Login required'})
				break;
			default:
				set({failed: true, reason: 'Not found'})
				break;
		}
	}
}

// ------------------------------------------------------
// 				       TROC DETAILS
// ------------------------------------------------------
function trocDetailsBuilder() {
	const { subscribe, set } = writable(null, set => (buildListenQuery('troc client', trocDetailsPromise, loadTrocDetails, set))())
	return { 
		subscribe, set,
	}
}

async function loadTrocDetails(set, {troc, client}) {
	if(!troc) return set(null)
	console.log('Load detail')
	
	let details = {}
	//load client's details if he exist
	if (client) {
		details = await getDetail(troc, client)
	} else {
		let user = client || await userPromiseSubscribed
		details = await getDetail(troc, user._id)
	}
	
	set(details)

	return 
}
