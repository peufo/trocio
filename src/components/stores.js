import { writable } from 'svelte/store'
import { getHeader } from './utils'
import qs from 'qs'

export let user = userBuilder()
export let userPromise = writable()
export let troc = trocBuilder()

function userBuilder() {
	const { subscribe, set} = writable({})
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
			if (res.ok && json.success){
				set(null)
			}
		},
		authenticate: async () => {
			let res = await fetch('/users/me')
			let json = await res.json()
			if (res.ok && !json.error) {
				set(json)
			}else{
				set(null)
			}
		}
	}

}


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
	console.log('Listen Query')
	loadTroc(set)
	addEventListener('locationchange', () => loadTroc(set))
	return () => {
		console.log('Stop Listen Query')
		removeEventListener('locationchange', () => loadTroc(set))
	}
}

async function loadTroc(set) {
	console.log('loadTroc')
	let { troc } = qs.parse(location.search.substr(1))
	if (troc) {
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
	
}
