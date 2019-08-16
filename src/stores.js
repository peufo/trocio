import { writable} from 'svelte/store'

export let troc = createTroc()
export let me = writable({}, getMe)

function getMe(set) {
	fetch('users/me').then(res => res.json()).then(set)
}

function createTroc() {
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