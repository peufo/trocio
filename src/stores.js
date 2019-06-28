import { writable} from 'svelte/store'

export let troc = writable({})
export let me = writable({}, getMe)

function getMe(set) {
	fetch('users/me').then(res => res.json()).then(json => {
		//Traitment à fair coté serveur ?
		//TODO: Corriger utils.updateTroc
		json.trocs = json.trocs.map(t => {
				for (let p in t.troc) t[p] = t.troc[p]
				delete t.troc
				t.admin = t.admin.indexOf(json._id) != -1
				t.cashier = t.cashier.indexOf(json._id) != -1
				return t
			})

		set(json)
	})
}