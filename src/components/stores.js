import { writable } from 'svelte/store'

let troc = trocBuilder()

function trocBuilder() {
	const { subscribe, set} = writable({})
	return {
		subscribe, set,
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

export { troc}