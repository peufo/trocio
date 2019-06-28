import { me, troc } from './stores'

export function getHeader(body, verb = 'POST') {
	return {
		method: verb,
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(body)
	}
}

export function updateTroc(json, cb) {
	if (json.success) {
		let newTroc = json.message
		me.update(m => {
			let index = m.trocs.map(t => t.troc._id).indexOf(newTroc._id)
			if  (index == -1) {
				m.trocs.push({provide: [], buy: [], pay: [], troc: getMeTroc(newTroc)})
			}else{
				m.trocs[index].troc = getMeTroc(newTroc)
			}
			return m
		})
		troc.set(newTroc)
		if (cb) cb()
	}else{
		alert(json.message)
	}		
}

function getMeTroc(newTroc) {
	return {
		admin: newTroc.admin.map(a => a._id),
		cashier: newTroc.cashier.map(c => c._id),
		name: newTroc.name,
		_id: newTroc._id
	}
}