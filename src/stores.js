import { readable } from 'svelte/store'

export let me = new readable([], getMe)

function getMe(set) {
	fetch('users/me').then(res => res.json()).then(set)
}