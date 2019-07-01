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
		troc.refresh(json.message)
		if (cb) cb()
	}else{
		alert(json.message)
	}
}
