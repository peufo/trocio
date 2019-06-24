import { writable } from 'svelte/store'

export let me = new writable([], getMe)
export let troc = new writable({})

function getMe(set) {
	fetch('users/me').then(res => res.json()).then(set)
}