import { writable} from 'svelte/store'

export let troc = createTroc()
export let me = writable({}, getMe)

function getMe(set) {
	fetch('users/me').then(res => res.json()).then(set)
}

function createTroc() {
	const { subscribe, set} = writable({})
	return {
		subscribe,
		find: id => fetch(`/trocs/${id}`).then(res => res.json()).then(set),
		refresh: newTroc => {
			set(newTroc)

			//Refresh me.trocs
			me.update(m => {
				let index = m.trocs.map(t => t._id).indexOf(newTroc._id)
				if  (index == -1) {
					m.trocs.push(getMeTroc(m, newTroc))
				}else{
					m.trocs[index] = getMeTroc(m, newTroc)
				}
				return m
			})
		}
	}
}

function getMeTroc(m, newTroc) {
	var isAdmin = newTroc.admin.map(a => a._id).indexOf(m._id) != -1
	var isCashier = newTroc.cashier.map(c => c._id).indexOf(m._id) != -1
	return {
		admin: isAdmin,
		cashier: isCashier,
		name: newTroc.name,
		_id: newTroc._id
	}		
}