import { writable } from 'svelte/store'
import { getHeader, getDetail, detailEmpty } from './utils'
import qs from 'qs'
import { layout } from '@sveltech/routify'

export let user = userBuilder()
export let userPromise = writable()
export let troc = trocBuilder()
export let trocPromise = writable()
export let trocDetails = trocDetailsBuilder()
export let trocDetailsPromise = writable()

let userPromiseSubscribed
userPromise.subscribe(v => userPromiseSubscribed = v)


// ------------------------------------------------------
// 							UTIL
// ------------------------------------------------------
function buildListenQuery(query, promise, load, set) {
	query = query.split(' ')
	let lastQuery = undefined
	let newQuery = undefined
	let setPromise = () => {
		let parsed = qs.parse(location.search.substr(1))
		newQuery = query.map(q => parsed[q]).join(' ')
		if (newQuery != lastQuery) promise.set(load(set, parsed))
		lastQuery = newQuery
	}
	return set => {
		setPromise()
		console.log(`Start Listen Query ${query}`)
		addEventListener('locationchange', setPromise)
		return () => {
			console.log(`Stop Listen Query ${query}`)
			removeEventListener('locationchange', setPromise)
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
				set(json)
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
		return Error()
	}
}

// ------------------------------------------------------
// 							TROC
// ------------------------------------------------------

function trocBuilder() {
	const { subscribe, set } = writable({}, listenQuery)
	return {
		subscribe, set,
		//TODO: Can be removed ?
		find: async id => {
			let res = await fetch(`/trocs/${id}`)
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
		},
		refresh: newTroc => {
			set(newTroc)
		}
	}
}

function listenQuery(set) {
	let setPromise = () => {
		trocPromise.set(loadTroc(set))
	}
	setPromise()
	addEventListener('locationchange', setPromise)
	return () => {
		console.log('Stop Listen Query')
		removeEventListener('locationchange', setPromise)
	}
}

async function loadTroc(set, troc) {
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
	const { subscribe, set } = writable({}, set => (buildListenQuery('troc client', trocDetailsPromise, loadTrocDetails, set))())
	return { 
		subscribe, set,
	}
}

async function loadTrocDetails(set, {troc, client}) {
	if(!troc) return set(null)
	console.log('LOAD DETAILS ', troc)
	//TODO: PAGE condition
	// NON Il faut alimenté le composant Resume

	let user = await userPromiseSubscribed
	let details = await getDetail(troc, user._id)
	set(details)
	return 
}
